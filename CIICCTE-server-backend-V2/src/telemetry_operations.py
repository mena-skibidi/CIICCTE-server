import asyncio
import json
import os
import pwd

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from db_models import linux_user
from db_setup import engine


async def get_server_details():
    results = await asyncio.create_subprocess_exec(
        "fastfetch",
        "--json",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await results.communicate()
    raw_json = json.loads(stdout.decode("utf-8"))

    def _find_result(type_name: str):
        normalized = type_name.lower().replace(" ", "").replace("_", "")
        for item in raw_json:
            t = str(item.get("type", "")).lower().replace(" ", "").replace("_", "")
            if t == normalized:
                return item.get("result")
        return None

    cpu_data = _find_result("CPU")
    gpu_data = _find_result("GPU")
    ram_data = _find_result("Memory")
    physical_raw = _find_result("PhysicalDisk")
    if physical_raw is None:
        physical_raw = _find_result("Physical Disk")
    if physical_raw is None:
        physical_raw = []

    # CPU/GPU/Memory defensivo
    cpu_name = cpu_data.get("cpu") if isinstance(cpu_data, dict) else None
    cpu_physical = (
        cpu_data.get("cores", {}).get("physical") if isinstance(cpu_data, dict) else None
    )
    cpu_logical = (
        cpu_data.get("cores", {}).get("logical") if isinstance(cpu_data, dict) else None
    )
    gpu_name = None
    if isinstance(gpu_data, list) and gpu_data:
        gpu_name = gpu_data[0].get("name") if isinstance(gpu_data[0], dict) else None
    ram_amount = None
    if isinstance(ram_data, dict) and "total" in ram_data:
        ram_amount = round(ram_data["total"] / 1024**3, 2)

    # PhysicalDisk: solo fisico
    disks = []
    total_bytes = 0
    for d in physical_raw if isinstance(physical_raw, list) else []:
        if not isinstance(d, dict):
            continue
        size = d.get("size") or 0
        total_bytes += size if isinstance(size, (int, float)) else 0
        disks.append(
            {
                "name": d.get("name") or d.get("devPath") or "Desconocido",
                "dev_path": d.get("devPath") or d.get("dev_path") or "",
                "kind": d.get("kind") or "",
                "interconnect": d.get("interconnect") or "",
                "size_gb": round((size or 0) / 1024**3, 2),
                "temperature": d.get("temperature"),
            }
        )

    # Fallback si fastfetch no ve discos (caso contenedor sin privileged o sin mounts).
    # Escanea /host/sys/block (montado desde docker-compose.yaml:50) y /sys/block directo.
    if not disks:
        fallback_disks, fallback_total = _fallback_physical_disks_from_host()
        if fallback_disks:
            disks = fallback_disks
            total_bytes = fallback_total

    storage_total_gb = round(total_bytes / 1024**3, 2)
    # Para discos físicos no hay concepto de disponible/uso, se reporta total como disponible
    storage_available_gb = storage_total_gb

    return {
        "data": {
            "cpu_name": cpu_name,
            "cpu_physical_cores": cpu_physical,
            "cpu_logical_cores": cpu_logical,
            "gpu_name": gpu_name,
            "ram_amount": ram_amount,
            "disks": disks,
            "disks_count": len(disks),
            "storage_total_gb": storage_total_gb,
            "storage_available_gb": storage_available_gb,
        },
        "error": stderr.decode("utf-8"),
    }


def _fallback_physical_disks_from_host():
    """Intenta leer discos fisicos desde /host/sys/block o /sys/block.
    Necesita docker-compose.yaml con privileged:true, pid:host y volumen /:/host:ro.
    Si no hay mounts o son vacios (entorno restringido), retorna vacio."""
    candidates = ["/host/sys/block", "/sys/block"]
    disks = []
    total = 0
    for base in candidates:
        if not os.path.isdir(base):
            continue
        try:
            entries = os.listdir(base)
        except OSError:
            continue
        for dev in entries:
            # Filtrar loops, ram, dm, zram, fd
            if dev.startswith(("loop", "ram", "dm-", "zram", "fd", "sr")):
                continue
            dev_path = os.path.join(base, dev)
            # Evitar particiones: si existe archivo "partition" es particion
            if os.path.exists(os.path.join(dev_path, "partition")):
                continue
            # Evitar dispositivos sin size o con size 0 (virtuales)
            size_path = os.path.join(dev_path, "size")
            try:
                with open(size_path) as f:
                    sectors = int(f.read().strip())
                size_bytes = sectors * 512
            except (OSError, ValueError):
                size_bytes = 0
            if size_bytes == 0:
                continue
            # Nombre: intentar vendor+model
            name = dev
            try:
                model_path = os.path.join(dev_path, "device", "model")
                vendor_path = os.path.join(dev_path, "device", "vendor")
                if os.path.exists(model_path):
                    with open(model_path) as f:
                        model = f.read().strip()
                    vendor = ""
                    if os.path.exists(vendor_path):
                        with open(vendor_path) as f:
                            vendor = f.read().strip()
                    candidate = f"{vendor} {model}".strip()
                    if candidate:
                        name = candidate
            except OSError:
                pass
            # Fallback nombre desde /host/dev o /dev path
            dev_path_str = f"/dev/{dev}"
            # Kind: rotational 0 => SSD, 1 => HDD
            kind = ""
            try:
                with open(os.path.join(dev_path, "queue", "rotational")) as f:
                    kind = "SSD" if f.read().strip() == "0" else "HDD"
            except OSError:
                # nvme suele ser SSD
                if dev.startswith("nvme"):
                    kind = "SSD"
            # Interconnect: intento simple
            interconnect = ""
            if dev.startswith("nvme"):
                interconnect = "NVMe"
            elif dev.startswith("mmcblk"):
                interconnect = "MMC"
            elif dev.startswith("vd"):
                interconnect = "Virtio"
            elif dev.startswith(("sd", "hd")):
                # distinguir USB vs SATA via /sys/block/<dev>/device/transport o removable?
                interconnect = "SATA"
            disks.append(
                {
                    "name": name,
                    "dev_path": dev_path_str,
                    "kind": kind,
                    "interconnect": interconnect,
                    "size_gb": round(size_bytes / 1024**3, 2),
                    "temperature": None,
                }
            )
            total += size_bytes
        if disks:
            # Encontrado en este base, no probar siguiente
            break
    return disks, total


def get_linux_users():
    users = []
    for entry in pwd.getpwall():
        if (
            entry.pw_uid >= 1000 and entry.pw_uid != 65534
        ):  # en teoria todos los ids apartir del 1000 son usuarios a excepcion del 65534
            users.append(
                {
                    "username": entry.pw_name,
                    "user_id": entry.pw_uid,
                    "group_id": entry.pw_gid,
                    "home_dir": entry.pw_dir,
                }
            )
    return {"data": users, "count": len(users)}


def sync_linux_users():
    host = get_linux_users()
    inserted = 0
    with Session(engine) as session:
        for entry in host["data"]:
            exists = session.exec(
                select(linux_user).where(linux_user.uid == entry["user_id"])
            ).first()
            if exists:
                continue
            new_entry = linux_user(
                username=entry["username"],
                uid=entry["user_id"],
                gid=entry["group_id"],
                home_dir=entry["home_dir"],
                user_id=None,
            )
            session.add(new_entry)
            try:
                session.commit()
                inserted += 1
            except IntegrityError:
                session.rollback()
    return {
        "inserted": inserted,
        "skipped": host["count"] - inserted,
        "total_host": host["count"],
    }


def get_all_linux_users_db():
    with Session(engine) as session:
        rows = session.exec(select(linux_user).order_by(linux_user.username)).all()
        return {
            "data": [r.model_dump() for r in rows],
            "count": len(rows),
        }

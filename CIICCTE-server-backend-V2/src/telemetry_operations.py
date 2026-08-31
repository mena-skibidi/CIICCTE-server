import asyncio
import json
import pwd

from db_models import linux_user
from db_setup import engine
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select


async def get_server_details():
    results = await asyncio.create_subprocess_exec(
        "fastfetch",
        "--json",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await results.communicate()
    raw_json = json.loads(stdout.decode("utf-8"))
    cpu_data = next(item for item in raw_json if item["type"] == "CPU")["result"]
    gpu_data = next(item for item in raw_json if item["type"] == "GPU")["result"]
    ram_data = next(item for item in raw_json if item["type"] == "Memory")["result"]

    return {
        "data": {
            "cpu_name": cpu_data["cpu"],
            "cpu_physical_cores": cpu_data["cores"]["physical"],
            "cpu_logical_cores": cpu_data["cores"]["logical"],
            "gpu_name": gpu_data[0]["name"] if gpu_data else None,
            "ram_amount": round(ram_data["total"] / 1024**3, 2),
        },
        "error": stderr.decode("utf-8"),
    }


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

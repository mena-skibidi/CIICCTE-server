# ruff: noqa: BLE001, S112, RUF034
import os

CIICCTE_PROJECTS = {"ciiccte-server"}
CIICCTE_NETWORKS = {"db-net", "ciiccte-server_db-net"}
CIICCTE_VOLUMES = {"ciiccte-server_db", "ciiccte-server_gui", "db", "gui"}
CIICCTE_CONTAINERS = {"ciiccte-db", "db-gui", "ciiccte-server", "ciccte-frontend"}


def _classify_project(project: str | None, name: str) -> str:
    if project and project in CIICCTE_PROJECTS:
        return "operacional"
    if project and project.startswith("user-"):
        return "usuario"
    if name.startswith("user-"):
        return "usuario"
    if name in CIICCTE_CONTAINERS or name in CIICCTE_NETWORKS or name in CIICCTE_VOLUMES:
        return "operacional"
    # Labels con ciiccte.user se consideran usuario
    return "usuario"


def _classify_container(c) -> str:
    labels = c.labels or {}
    project = labels.get("com.docker.compose.project")
    if labels.get("ciiccte.user"):
        return "usuario"
    return _classify_project(project, c.name.lstrip("/"))


def _classify_network(n) -> str:
    labels = getattr(n, "attrs", {}).get("Labels") or {}
    project = labels.get("com.docker.compose.project")
    name = n.name
    if labels.get("ciiccte.user"):
        return "usuario"
    return _classify_project(project, name)


def _classify_volume(v) -> str:
    labels = getattr(v, "attrs", {}).get("Labels") or {}
    project = labels.get("com.docker.compose.project")
    name = v.name
    if labels.get("ciiccte.user"):
        return "usuario"
    return _classify_project(project, name)


def _get_client():
    try:
        import docker

        return docker.from_env()
    except Exception as e:
        raise RuntimeError(f"docker no disponible: {e}") from e


def get_docker_overview():
    error = None
    operacional = {"containers": [], "networks": [], "volumes": [], "compose_projects": []}
    usuario = {"containers": [], "networks": [], "volumes": [], "compose_projects": []}

    try:
        client = _get_client()
        # Verificar socket accesible
        client.ping()
    except Exception as e:
        return {
            "operacional": operacional,
            "usuario": usuario,
            "error": str(e) + " (requiere /var/run/docker.sock:ro en compose)",
        }

    try:
        # Containers: incluir tanto running como detenidos (all=True)
        containers = client.containers.list(all=True)
        for c in containers:
            try:
                info = {
                    "id": c.id[:12] if len(c.id) > 12 else c.id,
                    "name": c.name.lstrip("/"),
                    "image": (c.image.tags[0] if c.image.tags else c.image.short_id) if hasattr(c, "image") else "",
                    "state": getattr(c, "status", "") or c.attrs.get("State", {}).get("Status", ""),
                    "status": (c.attrs.get("State", {}).get("Status", "") + " " + str(c.attrs.get("State", {}).get("Running", ""))).strip()
                    or getattr(c, "status", ""),
                    "project": (c.labels or {}).get("com.docker.compose.project"),
                    "labels": c.labels or {},
                }
                # Normalizar state
                raw_state = c.attrs.get("State", {})
                if isinstance(raw_state, dict):
                    if raw_state.get("Running"):
                        info["state"] = "running"
                    elif raw_state.get("Status"):
                        info["state"] = raw_state.get("Status")
                cat = _classify_container(c)
                if cat == "operacional":
                    operacional["containers"].append(info)
                else:
                    usuario["containers"].append(info)
            except Exception:
                continue

        # Networks
        try:
            networks = client.networks.list()
            for n in networks:
                try:
                    attrs = n.attrs or {}
                    labels = attrs.get("Labels") or {}
                    info = {
                        "name": n.name,
                        "driver": attrs.get("Driver", "") or getattr(n, "attrs", {}).get("Driver", ""),
                        "scope": attrs.get("Scope", ""),
                        "project": labels.get("com.docker.compose.project"),
                        "labels": labels,
                    }
                    cat = _classify_network(n)
                    if cat == "operacional":
                        operacional["networks"].append(info)
                    else:
                        usuario["networks"].append(info)
                except Exception:
                    continue
        except Exception as e:
            error = (error + "; " if error else "") + f"networks: {e}"

        # Volumes
        try:
            volumes = client.volumes.list()
            for v in volumes:
                try:
                    attrs = v.attrs or {}
                    labels = attrs.get("Labels") or {}
                    info = {
                        "name": v.name,
                        "driver": attrs.get("Driver", ""),
                        "mountpoint": attrs.get("Mountpoint", ""),
                        "project": labels.get("com.docker.compose.project"),
                        "labels": labels,
                    }
                    cat = _classify_volume(v)
                    if cat == "operacional":
                        operacional["volumes"].append(info)
                    else:
                        usuario["volumes"].append(info)
                except Exception:
                    continue
        except Exception as e:
            error = (error + "; " if error else "") + f"volumes: {e}"

        # Compose projects: agrupar por label
        try:
            projects = set()
            for c in containers:
                p = (c.labels or {}).get("com.docker.compose.project")
                if p:
                    projects.add(p)
            for p in sorted(projects):
                cat = "operacional" if p in CIICCTE_PROJECTS or p == "ciiccte-server" else "usuario" if p.startswith("user-") else "usuario"
                # Si no es operacional ni user-*, considerar operacional solo si es ciiccte-server
                if p not in CIICCTE_PROJECTS and not p.startswith("user-"):
                    # Otros proyectos externos -> usuario
                    cat = "usuario"
                if cat == "operacional":
                    operacional["compose_projects"].append({"name": p})
                else:
                    usuario["compose_projects"].append({"name": p})
        except Exception as e:
            error = (error + "; " if error else "") + f"compose: {e}"

    except Exception as e:
        error = str(e)
        return {"operacional": operacional, "usuario": usuario, "error": error}

    # Fallback si docker.sock existe pero no hay volumen host montado, intentar leer via /host para debug
    if os.path.exists("/host/var/run/docker.sock") and not os.path.exists("/var/run/docker.sock"):
        hint = "docker.sock solo en /host, monta /var/run/docker.sock:ro"
        error = (error + "; " + hint) if error else hint

    return {"operacional": operacional, "usuario": usuario, "error": error}

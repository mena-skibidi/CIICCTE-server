from fastapi import APIRouter

from docker_operations import get_docker_overview
from telemetry_operations import (
    get_all_linux_users_db,
    get_server_details,
    sync_linux_users,
)

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])


@router.get("/linux-server-details")
async def linux_server_details():
    return await get_server_details()


@router.get("/linux-users")
def linux_users():
    return get_all_linux_users_db()


@router.get("/sync_linux_users")
def sync_linux_users_endpoint():
    return sync_linux_users()


@router.get("/docker/overview")
def docker_overview():
    return get_docker_overview()


@router.get("/docker/containers")
def docker_containers():
    data = get_docker_overview()
    return {"operacional": data["operacional"]["containers"], "usuario": data["usuario"]["containers"], "error": data["error"]}


@router.get("/docker/networks")
def docker_networks():
    data = get_docker_overview()
    return {"operacional": data["operacional"]["networks"], "usuario": data["usuario"]["networks"], "error": data["error"]}


@router.get("/docker/volumes")
def docker_volumes():
    data = get_docker_overview()
    return {"operacional": data["operacional"]["volumes"], "usuario": data["usuario"]["volumes"], "error": data["error"]}

from fastapi import APIRouter
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

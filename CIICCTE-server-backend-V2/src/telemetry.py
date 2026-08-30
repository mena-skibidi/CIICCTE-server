from fastapi import APIRouter
from telemetry_operations import get_linux_users, get_server_details

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])


@router.get("/linux-server-details")
async def linux_server_details():
    return await get_server_details()


@router.get("/linux-users")
def linux_users():
    return get_linux_users()

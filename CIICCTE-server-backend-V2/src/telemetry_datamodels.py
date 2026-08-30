from pydantic import BaseModel


class ServerDetailsResponse(BaseModel):
    cpu_name: str
    cpu_physical_cores: int
    cpu_logical_cores: int
    gpu_name: str | None
    ram_amount: float


class LinuxUser(BaseModel):
    username: str
    user_id: int
    group_id: int
    home_dir: str


class LinuxUsersResponse(BaseModel):
    data: list[LinuxUser]
    count: int

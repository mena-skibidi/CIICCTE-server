from pydantic import BaseModel


class PhysicalDiskInfo(BaseModel):
    name: str
    dev_path: str
    kind: str
    interconnect: str
    size_gb: float
    temperature: float | None = None


class ServerDetailsResponse(BaseModel):
    cpu_name: str | None = None
    cpu_physical_cores: int | None = None
    cpu_logical_cores: int | None = None
    gpu_name: str | None = None
    ram_amount: float | None = None
    disks: list[PhysicalDiskInfo] = []
    disks_count: int = 0
    storage_total_gb: float = 0
    storage_available_gb: float = 0


class LinuxUser(BaseModel):
    username: str
    user_id: int
    group_id: int
    home_dir: str


class LinuxUsersResponse(BaseModel):
    data: list[LinuxUser]
    count: int


class DockerContainerInfo(BaseModel):
    id: str
    name: str
    image: str
    state: str
    status: str
    project: str | None = None
    labels: dict = {}


class DockerNetworkInfo(BaseModel):
    name: str
    driver: str
    scope: str
    project: str | None = None
    labels: dict = {}


class DockerVolumeInfo(BaseModel):
    name: str
    driver: str
    mountpoint: str
    project: str | None = None
    labels: dict = {}


class DockerOverviewResponse(BaseModel):
    operacional: dict
    usuario: dict
    error: str | None = None

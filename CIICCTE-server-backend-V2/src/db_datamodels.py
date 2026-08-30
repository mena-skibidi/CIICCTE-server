from pydantic import BaseModel


class create_user_datamodel(BaseModel):
    username: str
    nombre_completo: str | None = None
    password: str
    rol: int


class update_user_datamodel(BaseModel):
    username: str
    nombre_completo: str | None = None
    password: str | None = None
    rol: int | None = None
    roles_id: int | None = None


class login_data(BaseModel):
    username: str
    password: str


class UserPublic(BaseModel):
    id: int
    username: str
    nombre_completo: str
    account_status: str
    roles_id: int


class UsersResponse(BaseModel):
    data: list[UserPublic]
    count: int


class UserResponse(BaseModel):
    data: UserPublic

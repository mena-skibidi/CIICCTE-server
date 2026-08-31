from sqlmodel import Field, SQLModel


class roles(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    nombre_rol: str


class users(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    nombre_completo: str
    password_encriptada: str
    account_status: (
        str  # A nivel de backend los valores posibles seran "activa", "desactivada"
    )
    roles_id: int = Field(
        default=None, foreign_key="roles.id"
    )  # A nivel de backend los valores son 1 y 2, 1 para admin y 2 para user


class linux_user(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    uid: int = Field(index=True, unique=True)
    gid: int
    home_dir: str
    user_id: int | None = Field(default=None, foreign_key="users.id", index=True)

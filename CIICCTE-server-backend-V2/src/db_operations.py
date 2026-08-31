from db_models import roles, users
from db_setup import engine
from sqlmodel import Session, select


def create_user_db(
    username: str, nombre_completo: str, password_sin_hashear: str, rol: int
):
    with Session(engine) as session:
        rol_exists = session.exec(select(roles).where(roles.id == rol)).first()
        if not rol_exists:
            raise ValueError(f"rol {rol} no existe (debe ser 1 admin o 2 usuario)")
        # En produccion las contrasena se deben almacenar encriptadas, por el momento se almacenan en texto plano
        clave_privada = password_sin_hashear
        new_user = users(
            username=username,
            nombre_completo=nombre_completo,
            password_encriptada=clave_privada,
            account_status="activa",
            roles_id=rol,
        )
        session.add(new_user)
        session.commit()


def delete_user_db(username: str):
    with Session(engine) as session:
        # Por motivos de seguridad lo mejor seria nunca borrar cuentas solo desactivarlas
        delete_select_statement = select(users).where(users.username == username)
        user = session.exec(delete_select_statement).first()
        if user and user.account_status != "desactivada":
            user.account_status = "desactivada"
            session.add(user)
            session.commit()
            session.refresh(user)


def update_user_db(username: str, data: dict):
    with Session(engine) as session:
        statement = select(users).where(users.username == username)
        user = session.exec(statement).first()
        if not user:
            return None
        # failsafe: no permitir cambiar el rol del usuario admin
        if username == "admin" and ("rol" in data or "roles_id" in data):
            raise PermissionError("no se puede modificar el rol del usuario admin")
        # soportar tanto `rol` (legado) como `roles_id` (usado por bruno put_user_role_change)
        if "rol" in data:
            data["roles_id"] = data.pop("rol")
        # validar rol si se modifica
        if "roles_id" in data:
            rol_id = data["roles_id"]
            rol_exists = session.exec(select(roles).where(roles.id == rol_id)).first()
            if not rol_exists:
                raise ValueError(
                    f"rol {rol_id} no existe (debe ser 1 admin o 2 usuario)"
                )
        if "password" in data:
            data["password_encriptada"] = data.pop("password")
        data.pop("username", None)

        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)

        session.add(user)
        session.commit()
        session.refresh(user)
        return user


def login_process_db(username: str, password: str):
    with Session(engine) as session:
        statement = select(users).where(
            users.username == username,
            users.password_encriptada == password,
        )
        user = session.exec(statement).first()
        # TODO seguir los docs de fastapi para lidiar con la autenticacion https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/#recap
        if user:
            print("Usuario valido")
        else:
            print("Usuario invalido")


def _to_public(user: users) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "nombre_completo": user.nombre_completo,
        "account_status": user.account_status,
        "roles_id": user.roles_id,
    }


def get_user_db(user_id: int | None = None, username: str | None = None):
    with Session(engine) as session:
        if user_id is not None:
            statement = select(users).where(users.id == user_id)
        else:
            statement = select(users).where(users.username == username)
        return session.exec(statement).first()


def get_all_users_db():
    with Session(engine) as session:
        return list(session.exec(select(users)).all())

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from db_models import linux_user, roles, users
from db_setup import engine


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
        # Toggle activa/desactivada manteniendo mismo endpoint DELETE
        delete_select_statement = select(users).where(users.username == username)
        user = session.exec(delete_select_statement).first()
        if user:
            user.account_status = (
                "desactivada" if user.account_status == "activa" else "activa"
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            return user
        return None


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


def link_linux_user_db(linux_uid: int, user_id: int | None):
    with Session(engine) as session:
        lu = session.exec(select(linux_user).where(linux_user.uid == linux_uid)).first()
        if not lu:
            raise ValueError(f"linux_user uid {linux_uid} no existe")
        if user_id is None:
            lu.user_id = None
            session.add(lu)
            try:
                session.commit()
                session.refresh(lu)
            except IntegrityError as e:
                session.rollback()
                raise ValueError(str(e)) from e
            return lu
        # Validar usuario existe y es regular activo
        target = session.exec(select(users).where(users.id == user_id)).first()
        if not target:
            raise ValueError(f"usuario id {user_id} no existe")
        # 1-1: verificar que no esté ya vinculado a otro linux_user
        existing = session.exec(
            select(linux_user).where(linux_user.user_id == user_id)
        ).first()
        if existing and existing.uid != linux_uid:
            raise ValueError(
                f"usuario {target.username} ya vinculado a linux_user {existing.username} (uid {existing.uid})"
            )
        lu.user_id = user_id
        session.add(lu)
        try:
            session.commit()
            session.refresh(lu)
        except IntegrityError as e:
            session.rollback()
            raise ValueError(f"user_id {user_id} ya vinculado") from e
        return lu

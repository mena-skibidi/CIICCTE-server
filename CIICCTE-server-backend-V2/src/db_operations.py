from db_models import users
from db_utility import engine
from sqlmodel import Session, select


def create_user_db(
    username: str, nombre_completo: str, password_sin_hashear: str, rol: int
):
    with Session(engine) as session:
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


def update_user_db(username: str, data: dict):
    with Session(engine) as session:
        statement = select(users).where(users.username == username)
        user = session.exec(statement).first()
        if user:
            if "password" in data:
                data["password_encriptada"] = data["password"]
                data.pop("password", None)

            for key, value in data.items():
                setattr(user, key, value)

            session.add(user)
            session.commit()
            session.refresh(user)


def login_process_db(username: str, password: str):
    with Session(engine) as session:
        statement = select(users).where(
            users.username == username and users.password_encriptada == password
        )
        user = session.exec(statement).first()
        # TODO seguir los docs de fastapi para lidiar con la autenticacion https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/#recap
        if user:
            print("Usuario valido")
        else:
            print("Usuario invalido")

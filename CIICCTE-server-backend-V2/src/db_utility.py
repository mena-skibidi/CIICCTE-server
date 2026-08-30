from db_models import roles, users
from sqlmodel import Session, SQLModel, create_engine, select

engine = create_engine("postgresql://dbuser:labtest321@db:5432/labdb", echo=True)


def db_setup():
    SQLModel.metadata.create_all(engine, checkfirst=True)

    with Session(engine) as session:
        role1_statement = select(roles).where(roles.id == 1)
        role1_exists_check = session.exec(role1_statement).first()
        if not role1_exists_check:
            print("El rol de admin no existe, creandolo")
            admin_role = roles(nombre_rol="admin")
            session.add(admin_role)
            session.commit()

        role2_statement = select(roles).where(roles.id == 2)
        role2_exists_check = session.exec(role2_statement).first()
        if not role2_exists_check:
            usuario_role = roles(nombre_rol="usuario")
            session.add(usuario_role)
            session.commit()

    with Session(engine) as session:
        admin_role_statement = select(users).where(users.username == "admin")
        admin_role_statement_check = session.exec(admin_role_statement).first()
        if not admin_role_statement_check:
            # import local para evitar ciclo db_utility -> db_operations
            from db_operations import create_user_db

            create_user_db("admin", "admin", "pwd123", 1)

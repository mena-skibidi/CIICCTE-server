from db_models import roles, users
from sqlmodel import Session, SQLModel, create_engine, select

engine = create_engine("postgresql://dbuser:labtest321@db:5432/labdb", echo=True)


def db_setup():
    SQLModel.metadata.create_all(engine, checkfirst=True)

    with Session(engine) as session:
        for exp_id, exp_name in [(1, "admin"), (2, "usuario")]:
            by_id = session.exec(select(roles).where(roles.id == exp_id)).first()
            by_name = session.exec(
                select(roles).where(roles.nombre_rol == exp_name)
            ).first()
            if by_id and by_id.nombre_rol != exp_name:
                by_id.nombre_rol = exp_name
                session.add(by_id)
                session.commit()
            elif not by_id and not by_name:
                session.add(roles(id=exp_id, nombre_rol=exp_name))
                session.commit()
            elif not by_id and by_name:
                if not session.exec(
                    select(roles).where(roles.id == exp_id)
                ).first():
                    session.add(roles(id=exp_id, nombre_rol=exp_name))
                    session.commit()

    with Session(engine) as session:
        admin_role_statement = select(users).where(users.username == "admin")
        admin_role_statement_check = session.exec(admin_role_statement).first()
        if not admin_role_statement_check:
            from db_operations import create_user_db

            create_user_db("admin", "admin", "pwd123", 1)

    from telemetry_operations import sync_linux_users

    sync_linux_users()

from fastapi import APIRouter, HTTPException, Query

from db_datamodels import (
    LinkLinuxUserRequest,
    create_user_datamodel,
    login_data,
    update_user_datamodel,
)
from db_operations import (
    _to_public,
    create_user_db,
    delete_user_db,
    get_all_users_db,
    get_user_db,
    link_linux_user_db,
    login_process_db,
    update_user_db,
)

router = APIRouter(prefix="/api/db", tags=["db"])


@router.post("/users")
def create_user(data: create_user_datamodel):
    try:
        create_user_db(data.username, data.nombre_completo, data.password, data.rol)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "usuario creado", "username": data.username}


@router.delete("/users")
def delete_user(username: str):
    user = delete_user_db(username)
    if user is None:
        raise HTTPException(status_code=404, detail="usuario no encontrado")
    return {
        "message": f"usuario {user.account_status}",
        "username": username,
        "account_status": user.account_status,
    }


@router.put("/users")
def update_user(data: update_user_datamodel):
    filtered_data = data.model_dump(exclude_unset=True)
    # failsafe: no permitir cambiar el rol del usuario admin
    if data.username == "admin" and (
        "rol" in filtered_data or "roles_id" in filtered_data
    ):
        raise HTTPException(
            status_code=403, detail="no se puede modificar el rol del usuario admin"
        )
    try:
        updated = update_user_db(data.username, filtered_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    if updated is None:
        raise HTTPException(status_code=404, detail="usuario no encontrado")
    return {"message": "usuario actualizado", "username": data.username}


@router.post("/login")
def login_process(data: login_data):
    from auth import create_token

    user = login_process_db(data.username, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="credenciales invalidas")
    token = create_token(user.username, user.roles_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "roles_id": user.roles_id,
        "nombre_completo": user.nombre_completo,
    }


@router.put("/linux-users/link")
def link_linux_user(data: LinkLinuxUserRequest):
    try:
        lu = link_linux_user_db(data.linux_uid, data.user_id)
    except ValueError as e:
        msg = str(e)
        if "no existe" in msg:
            raise HTTPException(status_code=404, detail=msg)
        if "ya vinculado" in msg:
            raise HTTPException(status_code=409, detail=msg)
        raise HTTPException(status_code=400, detail=msg)
    return {"message": "vinculo actualizado", "data": lu.model_dump()}


@router.get("/users")
def get_users(
    id: int | None = Query(None, ge=1),
    username: str | None = Query(None),
):
    if id is None and username is None:
        all_users = get_all_users_db()
        return {"data": [_to_public(u) for u in all_users], "count": len(all_users)}
    if id is not None and username is not None:
        raise HTTPException(
            status_code=400, detail="usa solo id o username, no ambos"
        )
    user = get_user_db(user_id=id, username=username)
    if not user:
        raise HTTPException(status_code=404, detail="usuario no encontrado")
    return {"data": _to_public(user)}

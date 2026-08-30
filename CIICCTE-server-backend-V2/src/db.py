from db_datamodels import create_user_datamodel, login_data, update_user_datamodel
from db_operations import (
    _to_public,
    create_user_db,
    delete_user_db,
    get_all_users_db,
    get_user_db,
    login_process_db,
    update_user_db,
)
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/db", tags=["db"])


@router.post("/users")
def create_user(data: create_user_datamodel):
    create_user_db(data.username, data.nombre_completo, data.password, data.rol)


@router.delete("/users")
def delete_user(username: str):
    delete_user_db(username)


@router.put("/users")
def update_user(data: update_user_datamodel):
    filtered_data = data.model_dump(exclude_unset=True)
    update_user_db(data.username, filtered_data)


@router.post("/login")
def login_process(data: login_data):
    login_process_db(data.username, data.password)


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

from db_datamodels import create_user_datamodel, login_data, update_user_datamodel
from db_operations import (
    create_user_db,
    delete_user_db,
    login_process_db,
    update_user_db,
)
from fastapi import APIRouter

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

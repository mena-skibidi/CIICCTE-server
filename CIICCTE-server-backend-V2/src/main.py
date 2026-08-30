import asyncio
import json
import pwd

from fastapi import FastAPI

from datamodels import create_user_datamodel, login_data, update_user_datamodel
from db import (
    create_user_db,
    db_setup,
    delete_user_db,
    login_process_db,
    update_user_db,
)

server = FastAPI()


@server.on_event("startup")
def on_server_start_setup():
    db_setup()


# Endpoints


# @server.post("/users")
# def create_user(data: create_user_datamodel):
#     create_user_db(data.username, data.nombre_completo, data.password, data.rol)


# @server.delete("/users")
# def delete_user(username: str):
#     delete_user_db(username)


# @server.put("/users")
# def update_user(data: update_user_datamodel):
#     filtered_data = data.model_dump(exclude_unset=True)
#     update_user_db(data.username, filtered_data)


# @server.post("/login")
# def login_process(data: login_data):
#     login_process_db(data.username, data.password)


@server.get("/linux-server-details")
async def command_test():
    results = await asyncio.create_subprocess_exec(
        "fastfetch",
        "--json",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await results.communicate()
    raw_json = json.loads(stdout.decode("utf-8"))
    cpu_data = next(item for item in raw_json if item["type"] == "CPU")["result"]
    gpu_data = next(item for item in raw_json if item["type"] == "GPU")["result"]
    ram_data = next(item for item in raw_json if item["type"] == "Memory")["result"]

    return {
        "data": {
            "cpu_name": cpu_data["cpu"],
            "cpu_physical_cores": cpu_data["cores"]["physical"],
            "cpu_logical_cores": cpu_data["cores"]["logical"],
            "gpu_name": gpu_data[0]["name"] if gpu_data else None,
            "ram_amount": round(ram_data["total"] / 1024**3, 2),
        },
        "error": stderr.decode("utf-8"),
    }


@server.get("/linux-users")
def get_linux_users():
    users = []
    for entry in pwd.getpwall():
        if (
            entry.pw_uid >= 1000 and entry.pw_uid != 65534
        ):  # en teoria todos los ids apartir del 1000 son usuarios a excepcion del 65534
            users.append(
                {
                    "username": entry.pw_name,
                    "user_id": entry.pw_uid,
                    "group_id": entry.pw_gid,
                    "home_dir": entry.pw_dir,
                }
            )
    return {"data": users, "count": len(users)}

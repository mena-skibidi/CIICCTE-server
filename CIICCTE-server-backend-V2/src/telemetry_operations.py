import asyncio
import json
import pwd


async def get_server_details():
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

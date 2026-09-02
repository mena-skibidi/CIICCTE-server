import secrets
from datetime import UTC, datetime, timedelta
from pathlib import Path

import jwt
from pwdlib import PasswordHash

_hasher = PasswordHash.recommended()

# Buscar firmatokns.txt en varios lugares (repo y runtime)
_CANDIDATES = [
    Path(__file__).parent / "firmatokns.txt",
    Path(__file__).parent.parent / "firmatokns.txt",
    Path.cwd() / "firmatokns.txt",
    Path.cwd() / "src" / "firmatokns.txt",
]


def _get_secret_path() -> Path:
    for p in _CANDIDATES:
        if p.exists():
            return p
    # no existe -> generar en src/firmatokns.txt
    target = Path(__file__).parent / "firmatokns.txt"
    return target


def get_secret() -> str:
    path = _get_secret_path()
    if path.exists():
        try:
            txt = path.read_text().strip()
            if txt:
                return txt
        except OSError:
            pass
    # generar una sola vez
    secret = secrets.token_hex(32)
    try:
        path.write_text(secret)
    except OSError:
        # fallback a parent
        try:
            alt = Path(__file__).parent.parent / "firmatokns.txt"
            alt.write_text(secret)
            path = alt
        except OSError:
            pass
    return secret


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(hash_: str, password: str) -> bool:
    try:
        return _hasher.verify(password, hash_)
    except Exception:  # noqa: BLE001
        return False


def create_token(username: str, roles_id: int, expires_minutes: int = 60 * 24) -> str:
    secret = get_secret()
    exp = datetime.now(UTC) + timedelta(minutes=expires_minutes)
    payload = {"sub": username, "roles_id": roles_id, "exp": exp}
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_token(token: str) -> dict:
    secret = get_secret()
    return jwt.decode(token, secret, algorithms=["HS256"])

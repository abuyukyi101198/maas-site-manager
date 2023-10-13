from datetime import (
    datetime,
    timedelta,
)
import os
from typing import (
    Any,
    cast,
)

from jose import (
    jwt,
    JWTError,
)

TOKEN_ALGORITHM = "HS256"
TOKEN_SECRET_KEY_BYTES = 32
TOKEN_DURATION_MINUTES = 30


class InvalidToken(Exception):
    """Token is invalid"""


def generate_key() -> str:
    """Generate a random secret key."""
    return os.urandom(TOKEN_SECRET_KEY_BYTES).hex()


def create_token(
    subject: str,
    key: str = "",
    duration: timedelta | None = None,
    data: dict[str, Any] | None = None,
) -> str:
    """Create a JWT token and return its encoded form as string."""
    if duration is None:
        duration = timedelta(minutes=TOKEN_DURATION_MINUTES)
    if data is None:
        data = {}
    payload = data | {
        "sub": subject,
        "iss": "MAAS site manager",
        "exp": datetime.utcnow() + duration,
    }
    encoded = jwt.encode(payload, key, algorithm=TOKEN_ALGORITHM)
    return str(encoded)


def decode_token(token: str, key: str = "") -> tuple[str, dict[str, Any]]:
    """Decode a JWT and return its subject and data."""
    try:
        payload = jwt.decode(token, key, algorithms=[TOKEN_ALGORITHM])
    except JWTError:
        raise InvalidToken()
    try:
        subject = payload.pop("sub")
    except KeyError:
        raise InvalidToken()
    expiration = payload.pop("exp", None)
    if (
        not expiration
        or datetime.utcfromtimestamp(expiration) < datetime.utcnow()
    ):
        raise InvalidToken()
    payload.pop("iss", None)  # don't include it in returned data
    return cast(str, subject), payload

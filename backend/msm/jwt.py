import dataclasses
from datetime import (
    datetime,
    timedelta,
)
from functools import cached_property
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


@dataclasses.dataclass(frozen=True)
class JWT:
    payload: dict[str, Any]
    encoded: str

    _REQUIRED_FIELDS = frozenset(("sub", "iss", "exp"))

    @cached_property
    def subject(self) -> str:
        return cast(str, self.payload["sub"])

    @cached_property
    def expiration(self) -> datetime:
        return datetime.utcfromtimestamp(self.payload["exp"])

    @cached_property
    def data(self) -> dict[str, Any]:
        return {
            key: value
            for key, value in self.payload.items()
            if key not in self._REQUIRED_FIELDS
        }

    @classmethod
    def create(
        cls,
        subject: str,
        key: str = "",
        duration: timedelta | None = None,
        data: dict[str, Any] | None = None,
    ) -> "JWT":
        """Create a JWT."""
        if duration is None:
            duration = timedelta(minutes=TOKEN_DURATION_MINUTES)
        if data is None:
            data = {}
        expiration = datetime.utcnow() + duration
        payload = data | {
            "sub": subject,
            "iss": "MAAS site manager",
            "exp": expiration,
        }
        encoded = jwt.encode(payload, key, algorithm=TOKEN_ALGORITHM)
        return cls(
            payload=payload,
            encoded=encoded,
        )

    @classmethod
    def decode(cls, encoded: str, key: str = "") -> "JWT":
        """Decode a token string."""
        try:
            payload = jwt.decode(encoded, key, algorithms=[TOKEN_ALGORITHM])
        except JWTError:
            raise InvalidToken()

        # check that all required fields are there
        if cls._REQUIRED_FIELDS - set(payload):
            raise InvalidToken()

        expiration = datetime.utcfromtimestamp(payload["exp"])
        if expiration < datetime.utcnow():
            raise InvalidToken()
        return JWT(
            payload=payload,
            encoded=encoded,
        )

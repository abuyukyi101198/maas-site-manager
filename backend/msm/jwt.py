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
from strenum import StrEnum

TOKEN_ALGORITHM = "HS256"
TOKEN_SECRET_KEY_BYTES = 32
TOKEN_DURATION = timedelta(minutes=30)


class InvalidToken(Exception):
    """Token is invalid"""


def generate_key() -> str:
    """Generate a random secret key."""
    return os.urandom(TOKEN_SECRET_KEY_BYTES).hex()


class TokenAudience(StrEnum):
    """Valid values for token audience."""

    API = "api"
    SITE = "site"


@dataclasses.dataclass(frozen=True)
class JWT:
    payload: dict[str, Any]
    encoded: str

    _REQUIRED_FIELDS: frozenset[str] = frozenset(
        ("aud", "iat", "iss", "exp", "sub")
    )

    @cached_property
    def issuer(self) -> str:
        return cast(str, self.payload["iss"])

    @cached_property
    def subject(self) -> str:
        return cast(str, self.payload["sub"])

    @cached_property
    def issued(self) -> datetime:
        return datetime.utcfromtimestamp(self.payload["iat"])

    @cached_property
    def expiration(self) -> datetime:
        return datetime.utcfromtimestamp(self.payload["exp"])

    @cached_property
    def audience(self) -> list[TokenAudience]:
        return [TokenAudience(entry) for entry in self.payload["aud"]]

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
        issuer: str,
        subject: str,
        audience: TokenAudience,
        key: str = "",
        duration: timedelta = TOKEN_DURATION,
        data: dict[str, Any] | None = None,
    ) -> "JWT":
        """Create a JWT."""
        if data is None:
            data = {}
        issued = datetime.utcnow()
        expiration = issued + duration
        payload = data | {
            "sub": subject,
            "iss": issuer,
            "iat": issued,
            "exp": expiration,
            "aud": [audience],
        }
        encoded = jwt.encode(payload, key, algorithm=TOKEN_ALGORITHM)
        return cls(
            payload=payload,
            encoded=encoded,
        )

    @classmethod
    def decode(
        cls,
        encoded: str,
        key: str = "",
        issuer: str | None = None,
        audience: TokenAudience | None = None,
    ) -> "JWT":
        """Decode a token string."""
        try:
            payload = jwt.decode(
                encoded,
                key,
                algorithms=[TOKEN_ALGORITHM],
                issuer=issuer,
                audience=str(audience) if audience else None,
            )
        except JWTError:
            raise InvalidToken()

        # check that all required fields are there
        if cls._REQUIRED_FIELDS - set(payload):
            raise InvalidToken()

        return JWT(
            payload=payload,
            encoded=encoded,
        )

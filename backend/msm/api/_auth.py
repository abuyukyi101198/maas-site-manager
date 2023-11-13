from typing import Callable
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from ..db.models import Config
from ..jwt import (
    InvalidToken,
    JWT,
)
from ._dependencies import config
from ._utils import INVALID_TOKEN_ERROR


def auth_id_from_token(
    oauth2_scheme: OAuth2PasswordBearer,
) -> Callable[[Config, str], UUID]:
    def auth_id_dep(
        config: Config = Depends(config),
        token: str = Depends(oauth2_scheme),
    ) -> UUID:
        try:
            decoded_token = JWT.decode(token, key=config.token_secret_key)
            decoded_token.validate(config.service_identifier)
        except (InvalidToken, ValueError):
            raise INVALID_TOKEN_ERROR
        return UUID(decoded_token.subject)

    return auth_id_dep


class AccessTokenResponse(BaseModel):
    """Content for a response returning a JWT."""

    token_type: str
    access_token: str


def token_response(config: Config, auth_id: UUID) -> AccessTokenResponse:
    """Retrun an AccessTokenResponse, generating a token."""
    token = JWT.create(
        issuer=config.service_identifier,
        subject=str(auth_id),
        key=config.token_secret_key,
    )
    return AccessTokenResponse(token_type="Bearer", access_token=token.encoded)

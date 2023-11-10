from typing import Annotated
import uuid

from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
)
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from ....db.models import (
    Config,
    PendingSiteCreate,
)
from ....jwt import (
    InvalidToken,
    JWT,
)
from ....service import ServiceCollection
from ..._dependencies import (
    config,
    services,
)
from ..._utils import INVALID_TOKEN_ERROR

v1_router = APIRouter(prefix="/v1")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token"
)  # XXX update url once defined


class EnrollPostRequest(BaseModel):
    """Request to enroll a site."""

    name: str
    url: str


@v1_router.post("/enroll")
async def post(
    response: Response,
    config: Annotated[Config, Depends(config)],
    services: Annotated[ServiceCollection, Depends(services)],
    request: EnrollPostRequest,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> None:
    try:
        decoded_token = JWT.decode(token, key=config.token_secret_key)
        decoded_token.validate(issuer=config.service_identifier)
    except InvalidToken:
        raise INVALID_TOKEN_ERROR

    auth_id = uuid.UUID(decoded_token.subject)
    db_token = await services.tokens.get_by_auth_id(auth_id)
    if db_token is None or db_token.is_expired():
        raise INVALID_TOKEN_ERROR

    await services.sites.create_pending(
        PendingSiteCreate(name=request.name, url=request.url, auth_id=auth_id)
    )
    await services.tokens.delete(db_token.id)
    response.status_code = status.HTTP_202_ACCEPTED

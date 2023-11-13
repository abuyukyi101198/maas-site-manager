from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
)
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from ....db.models import PendingSiteCreate
from ....service import ServiceCollection
from ..._auth import auth_id_from_token
from ..._dependencies import services
from ..._utils import INVALID_TOKEN_ERROR

v1_router = APIRouter(prefix="/v1")

OAUTH2_SCHEME = OAuth2PasswordBearer(
    tokenUrl="token"
)  # XXX update url once defined


class EnrollPostRequest(BaseModel):
    """Request to enroll a site."""

    name: str
    url: str


@v1_router.post("/enroll")
async def post(
    request: EnrollPostRequest,
    response: Response,
    services: ServiceCollection = Depends(services),
    auth_id: UUID = Depends(auth_id_from_token(OAUTH2_SCHEME)),
) -> None:
    db_token = await services.tokens.get_by_auth_id(auth_id)
    if db_token is None or db_token.is_expired():
        raise INVALID_TOKEN_ERROR

    await services.sites.create_pending(
        PendingSiteCreate(name=request.name, url=request.url, auth_id=auth_id)
    )
    await services.tokens.delete(db_token.id)
    response.status_code = status.HTTP_202_ACCEPTED

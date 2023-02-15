from datetime import (
    datetime,
    timedelta,
)
from uuid import UUID

from pydantic import BaseModel


class Site(BaseModel):
    """A MAAS installation."""

    id: int
    name: str
    last_checkin: datetime | None


class CreateTokensRequest(BaseModel):
    """Request to create one or more tokens, with a certain validity, expressed
    in seconds.

    """

    count: int = 1
    duration: timedelta


class CreateTokensResponse(BaseModel):
    """List of created tokens, along with their duration."""

    expiration: datetime
    tokens: list[UUID]

from datetime import (
    datetime,
    timedelta,
)
from typing import Any
from uuid import UUID

from pydantic import (
    BaseModel,
    Field,
    root_validator,
)

from ..db.models import (
    PendingSite,
    Site,
    Token,
    User,
)
from ..schema import PaginatedResults


class RootGetResponse(BaseModel):
    """Root handler response."""

    version: str


class TokensGetResponse(PaginatedResults):
    """List of existing tokens."""

    items: list[Token]


class TokensPostRequest(BaseModel):
    """
    Request to create one or more tokens, with a certain validity,
    expressed in seconds.
    """

    count: int = 1
    duration: timedelta


class TokensPostResponse(BaseModel):
    """List of created tokens, along with their duration."""

    expired: datetime
    tokens: list[UUID]


class SitesGetResponse(PaginatedResults):
    items: list[Site]


class PendingSitesGetResponse(PaginatedResults):
    items: list[PendingSite]


class PendingSitesPostRequest(BaseModel):
    """Request to accept/reject sites."""

    ids: list[int]
    accept: bool


class LoginPostRequest(BaseModel):
    """User login request schema."""

    username: str
    password: str


class LoginPostResponse(BaseModel):
    """User login response with JSON Web Token."""

    access_token: str
    token_type: str


class UsersGetResponse(PaginatedResults):
    """List of existing users."""

    items: list[User]


class UsersPostRequest(BaseModel):
    """
    Request to create a User.
    """

    full_name: str
    username: str
    email: str
    password: str = Field(min_length=8, max_length=100)
    confirm_password: str = Field(min_length=8, max_length=100)
    is_admin: bool = False

    @root_validator
    def passwords_match(cls, values: Any) -> Any:
        if values.get("password") != values.get("confirm_password"):
            raise ValueError("Provided passwords do not match.")
        return values


class UsersPostResponse(BaseModel):
    """Created user."""

    id: int
    email: str
    username: str
    full_name: str
    is_admin: bool


class UsersPasswordPostRequest(BaseModel):
    """User password change schema."""

    current_password: str
    new_password: str = Field(min_length=8, max_length=100)
    confirm_password: str = Field(min_length=8, max_length=100)

    @root_validator
    def passwords_match(cls, values: Any) -> Any:
        if values.get("new_password") != values.get("confirm_password"):
            raise ValueError("Provided passwords do not match.")
        return values


class UsersPatchRequest(BaseModel):
    """User Edit Details request schema."""

    full_name: str | None = None
    email: str | None = None
    password: str | None = Field(min_length=8, max_length=100)
    confirm_password: str | None = Field(min_length=8, max_length=100)
    is_admin: bool | None = None

    @root_validator
    def passwords_match(cls, values: Any) -> Any:
        if values.get("password") != values.get("confirm_password"):
            raise ValueError("Provided passwords do not match.")
        return values

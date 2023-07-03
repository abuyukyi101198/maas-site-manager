from datetime import (
    datetime,
    timedelta,
)
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import (
    db_session,
    queries,
)
from ...db.models import (
    Token,
    User,
)
from ...schema import (
    PaginatedResults,
    pagination_params,
    PaginationParams,
)
from .._csv import CSVResponse
from .._jwt import get_authenticated_user


class TokensGetResponse(PaginatedResults):
    """List of existing tokens."""

    items: list[Token]


async def get(
    session: Annotated[AsyncSession, Depends(db_session)],
    authenticated_user: Annotated[User, Depends(get_authenticated_user)],
    pagination_params: PaginationParams = Depends(pagination_params),
) -> TokensGetResponse:
    """Return all tokens"""
    total, results = await queries.get_tokens(
        session, pagination_params.offset, pagination_params.size
    )
    return TokensGetResponse(
        total=total,
        page=pagination_params.page,
        size=pagination_params.size,
        items=list(results),
    )


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


async def post(
    session: Annotated[AsyncSession, Depends(db_session)],
    authenticated_user: Annotated[User, Depends(get_authenticated_user)],
    create_request: TokensPostRequest,
) -> TokensPostResponse:
    """
    Create one or more tokens.
    Token duration (TTL) is expressed in seconds.
    """
    expired, tokens = await queries.create_tokens(
        session,
        create_request.duration,
        count=create_request.count,
    )
    return TokensPostResponse(expired=expired, tokens=tokens)


async def export_get(
    session: Annotated[AsyncSession, Depends(db_session)],
    authenticated_user: Annotated[User, Depends(get_authenticated_user)],
) -> CSVResponse:
    tokens = await queries.get_active_tokens(session)
    return CSVResponse(content=tokens)

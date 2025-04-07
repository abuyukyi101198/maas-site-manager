from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from msm.api.auth import auth_id_from_token, auth_id_from_token_multi_aud
from msm.api.dependencies import services
from msm.api.exceptions.catalog import (
    BaseExceptionDetail,
    ForbiddenException,
    UnauthorizedException,
)
from msm.api.exceptions.constants import ExceptionCode
from msm.db.models import User
from msm.jwt import TokenAudience, TokenPurpose
from msm.service import (
    ServiceCollection,
    UserService,
)

OAUTH2_SCHEME = OAuth2PasswordBearer(tokenUrl="v1/login")


async def authenticate_user(
    service: UserService,
    email: str,
    password: str,
) -> User | None:
    if user := await service.get_by_email(email):
        if await service.password_matches(user.id, password):
            return user
    return None


async def authenticated_user(
    services: Annotated[ServiceCollection, Depends(services)],
    auth_id: Annotated[
        UUID, Depends(auth_id_from_token(OAUTH2_SCHEME, TokenAudience.API))
    ],
) -> User:
    if user := await services.users.get_by_auth_id(auth_id):
        return user
    raise UnauthorizedException(
        code=ExceptionCode.INVALID_TOKEN,
        message="The token is not valid.",
        details=[
            BaseExceptionDetail(
                reason=ExceptionCode.INVALID_TOKEN,
                messages=["The token is not valid."],
                field="Authorization",
                location="header",
            )
        ],
    )


def authenticated_admin(
    user: Annotated[User, Depends(authenticated_user)],
) -> User:
    if not user.is_admin:
        raise ForbiddenException(
            code=ExceptionCode.MISSING_PERMISSIONS,
            message="Unauthorized credentials.",
            details=[
                BaseExceptionDetail(
                    reason=ExceptionCode.MISSING_PERMISSIONS,
                    messages=[
                        "The current user does not have permissions to perform this action."
                    ],
                    field="Authorization",
                    location="header",
                )
            ],
        )
    return user


async def verify_authenticated_user_or_worker(
    services: Annotated[ServiceCollection, Depends(services)],
    auth_id_and_aud: Annotated[
        tuple[UUID, TokenAudience],
        Depends(
            auth_id_from_token_multi_aud(
                OAUTH2_SCHEME, [TokenAudience.API, TokenAudience.WORKER]
            )
        ),
    ],
) -> User | None:
    if auth_id_and_aud[1] == TokenAudience.WORKER:
        db_token = await services.tokens.get_by_auth_id(
            auth_id_and_aud[0],
            audience=TokenAudience.WORKER,
            purpose=TokenPurpose.ACCESS,
        )
        if db_token is None or db_token.is_expired():
            raise UnauthorizedException(
                code=ExceptionCode.INVALID_TOKEN,
                message=f"The token is not valid. {auth_id_and_aud[0]}",
                details=[
                    BaseExceptionDetail(
                        reason=ExceptionCode.INVALID_TOKEN,
                        messages=["The token is not valid."],
                        field="Authorization",
                        location="header",
                    )
                ],
            )
        return None
    if user := await services.users.get_by_auth_id(auth_id_and_aud[0]):
        return user
    raise UnauthorizedException(
        code=ExceptionCode.INVALID_TOKEN,
        message="The token is not valid.",
        details=[
            BaseExceptionDetail(
                reason=ExceptionCode.INVALID_TOKEN,
                messages=["The token is not valid."],
                field="Authorization",
                location="header",
            )
        ],
    )

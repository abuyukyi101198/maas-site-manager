from sqlalchemy.ext.asyncio import AsyncSession

from ._site import (
    InvalidPendingSites,
    SiteService,
)
from ._token import TokenService
from ._user import UserService


class ServiceCollection:
    """Provide all services."""

    def __init__(self, session: AsyncSession):
        self.sites = SiteService(session)
        self.tokens = TokenService(session)
        self.users = UserService(session)


__all__ = [
    "ServiceCollection",
    "InvalidPendingSites",
    "TokenService",
    "UserService",
    "SiteService",
]

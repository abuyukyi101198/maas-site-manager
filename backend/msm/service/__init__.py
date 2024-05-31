from collections.abc import Iterable

from prometheus_client import CollectorRegistry
from sqlalchemy.ext.asyncio import AsyncConnection

from msm.service._base import Service
from msm.service._config import ConfigService
from msm.service._settings import SettingsService
from msm.service._site import InvalidPendingSites, SiteService
from msm.service._token import TokenService
from msm.service._user import UserService


class ServiceCollection:
    """Provide all services."""

    def __init__(self, connection: AsyncConnection):
        self.sites = SiteService(connection)
        self.tokens = TokenService(connection)
        self.users = UserService(connection)
        self.settings = SettingsService(connection)

    @property
    def services(self) -> Iterable[Service]:
        """Service collection."""
        return [self.sites, self.tokens, self.users, self.settings]

    @classmethod
    def register_metrics(cls, registry: CollectorRegistry) -> None:
        """Add metrics to registry."""
        Service.register_metrics(registry)

    async def collect_metrics(self) -> None:
        """Update metrics for this service."""
        for svc in self.services:
            await svc.collect_metrics()


__all__ = [
    "ConfigService",
    "InvalidPendingSites",
    "ServiceCollection",
    "SettingsService",
    "SiteService",
    "TokenService",
    "UserService",
]

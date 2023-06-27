from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    SecretStr,
)

from ..schema import TimeZone


class ConnectionStatus(str, Enum):
    STABLE = "stable"
    LOST = "lost"
    UNKNOWN = "unknown"


class SiteData(BaseModel):
    """Data for a site."""

    total_machines: int
    allocated_machines: int
    deployed_machines: int
    ready_machines: int
    error_machines: int
    other_machines: int
    last_seen: datetime


class Site(BaseModel):
    """A MAAS installation."""

    id: int
    name: str
    name_unique: bool
    city: str | None
    country: str | None = Field(min_length=2, max_length=2)
    latitude: str | None
    longitude: str | None
    note: str | None
    region: str | None
    street: str | None
    timezone: TimeZone | None
    url: str
    connection_status: ConnectionStatus
    stats: SiteData | None


class PendingSite(BaseModel):
    """A pending MAAS site."""

    id: int
    name: str
    url: str
    created: datetime


class Token(BaseModel):
    """A registration token for a site."""

    id: int
    value: UUID
    site_id: int | None
    expired: datetime
    created: datetime


class User(BaseModel):
    """A user."""

    id: int
    email: EmailStr = Field(title="email@example.com")
    username: str
    full_name: str
    is_admin: bool


class UserWithPassword(User):
    """A user with its password."""

    # use password.get_secret_value() to retrieve the value
    password: SecretStr = Field(min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """User updatable fields"""

    full_name: str | None
    email: str | None
    password: str | None
    is_admin: bool | None

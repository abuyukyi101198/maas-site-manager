from typing import NamedTuple

from fastapi import Query


class SiteFilterParams(NamedTuple):
    """Site filtering parameters."""

    city: list[str] | None
    country: list[str] | None
    name: list[str] | None
    note: list[str] | None
    region: list[str] | None
    street: list[str] | None
    timezone: list[str] | None
    url: list[str] | None


class UserFilterParams(NamedTuple):
    """User filtering parameters."""

    email: list[str] | None
    username: list[str] | None
    full_name: list[str] | None
    is_admin: list[bool] | None


async def site_filter_parameters(
    city: list[str] | None = Query(default=None, title="Filter for cities"),
    country: list[str]
    | None = Query(default=None, title="Filter for country"),
    name: list[str] | None = Query(default=None, title="Filter for names"),
    note: list[str] | None = Query(default=None, title="Filter for notes"),
    region: list[str] | None = Query(default=None, title="Filter for regions"),
    street: list[str] | None = Query(default=None, title="Filter for streets"),
    timezone: list[str]
    | None = Query(default=None, title="Filter for timezones"),
    url: list[str] | None = Query(default=None, title="Filter for urls"),
) -> SiteFilterParams:
    """Return parameters for site filtering."""
    return SiteFilterParams(
        city=city,
        country=country,
        name=name,
        note=note,
        region=region,
        street=street,
        timezone=timezone,
        url=url,
    )


async def user_filter_params(
    email: list[str]
    | None = Query(default=None, title="Filter for email address"),
    username: list[str]
    | None = Query(default=None, title="Filter for username"),
    full_name: list[str]
    | None = Query(default=None, title="Filter for full name"),
    is_admin: list[bool]
    | None = Query(default=None, title="Filter for admin status"),
) -> UserFilterParams:
    """Return parameters for user filtering."""
    return UserFilterParams(
        email=email,
        username=username,
        full_name=full_name,
        is_admin=is_admin,
    )

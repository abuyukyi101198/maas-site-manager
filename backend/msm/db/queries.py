from collections.abc import Iterable
from datetime import (
    datetime,
    timedelta,
)
from uuid import UUID

from sqlalchemy import (
    case,
    func,
    Operators,
    select,
    Table,
)
from sqlalchemy.ext.asyncio import AsyncSession

from .. import MAX_PAGE_SIZE
from ..schema import (
    Site as SiteSchema,
    Token as TokenSchema,
)
from ._tables import (
    Site,
    SiteData,
    Token,
)


def filters_from_arguments(
    table: Table,
    **kwargs: list[str] | None,
) -> Iterable[Operators]:
    """
    Yields clauses to join with AND and all entries for a single arg by OR.
    This enables to convert query params such as

      ?name=name1&name=name2&city=city

    to a where clause such as

      (name ilike %name1% OR name ilike %name2%) AND city ilike %city%

    :param table: the table to create the WHERE clause for
    :param kwargs: the parameters matching the table's column name
                   as keys and lists of strings that will be matched
                   via ilike
    :returns: a generator yielding where clause that joins all queries
              per column with OR and all columns with AND
    """
    for dimension, needles in kwargs.items():
        column = table.c[dimension]

        match needles:
            case [needle]:
                # If there's only one we don't need any ORs
                yield column.icontains(needle, autoescape=True)
            case [needle, *other_needles]:
                # More than one thing to match against, join them with OR
                clause = column.icontains(needle, autoescape=True) | False
                for needle in other_needles:
                    clause |= column.icontains(needle, autoescape=True)
                yield clause


async def get_filtered_sites(
    session: AsyncSession,
    offset: int = 0,
    limit: int = MAX_PAGE_SIZE,
    city: list[str] | None = [],
    country: list[str] | None = [],
    name: list[str] | None = [],
    note: list[str] | None = [],
    region: list[str] | None = [],
    street: list[str] | None = [],
    timezone: list[str] | None = [],
    url: list[str] | None = [],
) -> tuple[int, Iterable[SiteSchema]]:
    filters = list(
        filters_from_arguments(
            Site,
            city=city,
            country=country,
            name=name,
            note=note,
            region=region,
            street=street,
            timezone=timezone,
            url=url,
        )
    )
    count = (
        await session.execute(
            select(func.count())
            .select_from(Site)
            .where(*filters)  # type: ignore[arg-type]
        )
    ).scalar() or 0
    stmt = (
        select(
            Site.c.id,
            Site.c.name,
            Site.c.city,
            Site.c.country,
            Site.c.latitude,
            Site.c.longitude,
            Site.c.note,
            Site.c.region,
            Site.c.street,
            Site.c.timezone,
            Site.c.url,
            case(
                (
                    SiteData.c.site_id != None,  # noqa: E711
                    func.json_build_object(
                        "allocated_machines",
                        SiteData.c.allocated_machines,
                        "deployed_machines",
                        SiteData.c.deployed_machines,
                        "ready_machines",
                        SiteData.c.ready_machines,
                        "error_machines",
                        SiteData.c.error_machines,
                        "last_seen",
                        SiteData.c.last_seen,
                    ),
                ),
                else_=None,
            ).label("stats"),
        )
        .select_from(
            Site.join(SiteData, SiteData.c.site_id == Site.c.id, isouter=True)
        )
        .where(*filters)  # type: ignore[arg-type]
        .order_by(Site.c.id)
        .limit(limit)
        .offset(offset)
    )
    result = await session.execute(stmt)
    return count, [SiteSchema(**row._asdict()) for row in result.all()]


async def get_tokens(
    session: AsyncSession,
    offset: int = 0,
    limit: int = MAX_PAGE_SIZE,
) -> tuple[int, Iterable[TokenSchema]]:
    count = (
        await session.execute(select(func.count()).select_from(Token))
    ).scalar() or 0
    result = await session.execute(
        select(
            Token.c.id,
            Token.c.site_id,
            Token.c.value,
            Token.c.expired,
            Token.c.created,
        )
        .select_from(Token)
        .order_by(Token.c.id)
        .offset(offset)
        .limit(limit)
    )
    return count, [TokenSchema(**row._asdict()) for row in result.all()]


async def create_tokens(
    session: AsyncSession, duration: timedelta, count: int = 1
) -> tuple[datetime, list[UUID]]:
    created = datetime.utcnow()
    expired = created + duration
    result = await session.execute(
        Token.insert().returning(Token.c.value),
        [
            {
                "expired": expired,
                "created": created,
            }
            for _ in range(count)
        ],
    )
    return expired, [row[0] for row in result]

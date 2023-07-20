from typing import (
    Annotated,
    AsyncIterator,
    Iterator,
)

from fastapi import (
    Depends,
    Request,
)
from sqlalchemy.ext.asyncio import AsyncConnection

from ..service import ServiceCollection


async def db_connection(request: Request) -> AsyncIterator[AsyncConnection]:
    """Provide a DB connection to execute queries, within a transaction.

    Requires the TransactionMiddleware to be used.
    """
    yield request.app.state.conn


def services(
    connection: Annotated[AsyncConnection, Depends(db_connection)]
) -> Iterator[ServiceCollection]:
    """Provide the ServiceCollection to access services."""
    yield ServiceCollection(connection)

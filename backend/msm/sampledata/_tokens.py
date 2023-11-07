from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncConnection

from ..jwt import JWT
from ._db import (
    ModelCollection,
    SampleDataModel,
)


async def make_fixture_tokens(
    conn: AsyncConnection, secret_key: str
) -> list[SampleDataModel]:
    collection = ModelCollection("token")
    for _ in range(10):
        token = JWT.create(str(uuid4()), key=secret_key)
        collection.add(
            auth_id=token.subject,
            value=token.encoded,
            expired=token.expiration,
        )
    return await collection.create(conn)

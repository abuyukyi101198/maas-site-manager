from datetime import (
    datetime,
    timedelta,
)
import uuid

import pytest
from sqlalchemy.ext.asyncio.session import AsyncSession

from msm.db.queries import (
    get_active_tokens,
    user_exists,
)

from ..fixtures.db import Fixture


@pytest.mark.asyncio
async def test_get_active_tokens(
    fixture: Fixture, session: AsyncSession
) -> None:
    now = datetime.utcnow()
    uuid1, uuid2, uuid3 = [uuid.uuid4() for _ in range(3)]
    _, t2, t3 = await fixture.create(
        "token",
        [
            {
                "value": uuid1,
                "expired": now - timedelta(hours=1),
            },
            {
                "value": uuid2,
                "expired": now + timedelta(hours=1),
            },
            {
                "value": uuid3,
                "expired": now + timedelta(hours=2),
            },
        ],
    )
    assert [token.value for token in await get_active_tokens(session)] == [
        uuid2,
        uuid3,
    ]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "email,username,exists",
    [
        ("", "", False),
        ("admin@example.com", "admin", True),
        ("admin@example.com", "nonexistent_admin", True),
        ("nonexistent_admin@example.com", "admin", True),
        ("nonexistent_admin@example.com", "nonexistent_admin", False),
    ],
)
async def test_user_exists(
    session: AsyncSession,
    fixture: Fixture,
    email: str,
    username: str,
    exists: bool,
) -> None:
    phash1 = "$2b$12$F5sgrhRNtWAOehcoVO.XK.oSvupmcg8.0T2jCHOTg15M8N8LrpRwS"
    user_details = {
        "email": "admin@example.com",
        "username": "admin",
        "full_name": "Admin",
        "password": phash1,
        "is_admin": True,
    }
    await fixture.create(
        "user",
        [user_details],
        commit=True,
    )
    assert await user_exists(session, email, username) == exists

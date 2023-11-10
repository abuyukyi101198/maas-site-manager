from datetime import timedelta
from uuid import uuid4

import pytest

from ....fixtures.client import Client
from ....fixtures.factory import Factory


@pytest.mark.asyncio
class TestEnrollHandler:
    async def test_post(self, factory: Factory, app_client: Client) -> None:
        auth_id = uuid4()
        await factory.make_Token(auth_id=auth_id)
        app_client.authenticate(auth_id)
        response = await app_client.post(
            "/site/v1/enroll",
            json={"name": "new-site", "url": "https://site.example.com"},
        )
        assert response.status_code == 202
        # the token is removed
        assert await factory.get("token") == []
        # a pending site is created
        [pending_site] = await factory.get("site")
        assert pending_site["auth_id"] == auth_id
        assert not pending_site["accepted"]

    async def test_post_no_token_match(
        self, factory: Factory, app_client: Client
    ) -> None:
        app_client.authenticate(uuid4())
        response = await app_client.post(
            "/site/v1/enroll",
            json={"name": "new-site", "url": "https://site.example.com"},
        )
        assert response.status_code == 401

    async def test_post_token_expired(
        self, factory: Factory, app_client: Client
    ) -> None:
        auth_id = uuid4()
        await factory.make_Token(auth_id=auth_id, lifetime=timedelta(hours=-1))
        app_client.authenticate(auth_id)
        response = await app_client.post(
            "/site/v1/enroll",
            json={"name": "new-site", "url": "https://site.example.com"},
        )
        assert response.status_code == 401

import uuid

from fastapi import HTTPException
import pytest

from msm.api.site._auth import authenticated_site
from msm.db.models import Site
from msm.service import ServiceCollection

from ...fixtures.factory import Factory


@pytest.mark.asyncio
class TestAuthenticatedSite:
    async def test_valid_token(
        self,
        api_services: ServiceCollection,
        api_site: Site,
        api_site_auth_id: uuid.UUID,
    ) -> None:
        site = await authenticated_site(api_services, api_site_auth_id)
        assert site == api_site

    async def test_invalid_auth_id(
        self, api_services: ServiceCollection
    ) -> None:
        with pytest.raises(HTTPException) as error:
            await authenticated_site(api_services, uuid.uuid4())
        assert error.value.status_code == 401
        assert error.value.headers == {"WWW-Authenticate": "Bearer"}

    async def test_update_last_seen(
        self,
        factory: Factory,
        api_services: ServiceCollection,
        api_site: Site,
        api_site_auth_id: uuid.UUID,
    ) -> None:
        # no SiteData entry exists
        assert await factory.get("site_data") == []

        await authenticated_site(api_services, api_site_auth_id)
        # the entry gets created
        [site_data] = await factory.get("site_data")
        assert site_data["site_id"] == api_site.id

        await authenticated_site(api_services, api_site_auth_id)
        # the entry gets updated
        [new_site_data] = await factory.get("site_data")
        assert site_data["last_seen"] < new_site_data["last_seen"]

import pytest

from msm import __version__

from ...fixtures.client import Client


@pytest.mark.asyncio
async def test_get(app_client: Client) -> None:
    response = await app_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"version": __version__}


@pytest.mark.asyncio
async def test_get_authenticated(
    user_client: Client,
) -> None:
    response = await user_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"version": __version__}

from datetime import (
    datetime,
    timedelta,
)

# from fastapi.testclient import TestClient
from httpx import AsyncClient
import pytest

from ...testing.db import Fixture


@pytest.mark.asyncio
async def test_root(user_app_client: AsyncClient) -> None:
    response = await user_app_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"version": "0.0.1"}


@pytest.mark.asyncio
async def test_list_sites(
    user_app_client: AsyncClient, fixture: Fixture
) -> None:
    site1 = {
        "id": 1,
        "name": "LondonHQ",
        "city": "London",
        "country": "gb",
        "latitude": "51.509865",
        "longitude": "-0.118092",
        "note": "the first site",
        "region": "Blue Fin Bldg",
        "street": "110 Southwark St",
        "timezone": "0.00",
        "url": "https://londoncalling.example.com",
    }
    site2 = site1.copy()
    site2["id"] = 2
    site2["name"] = "BerlinHQ"
    site2["timezone"] = "1.00"
    site2["city"] = "Berlin"
    site2["country"] = "de"
    await fixture.create("sites", [site1, site2])
    page1 = await user_app_client.get("/sites")
    assert page1.status_code == 200
    assert page1.json() == {
        "page": 1,
        "size": 20,
        "total": 2,
        "items": [site1, site2],
    }
    filtered = await user_app_client.get("/sites?city=onDo")  # vs London
    assert filtered.status_code == 200
    assert filtered.json() == {
        "page": 1,
        "size": 20,
        "total": 1,
        "items": [site1],
    }
    paginated = await user_app_client.get("/sites?page=2&size=1")
    assert paginated.status_code == 200
    assert paginated.json() == {
        "page": 2,
        "size": 1,
        "total": 2,
        "items": [site2],
    }


@pytest.mark.asyncio
async def test_create_token(user_app_client: AsyncClient) -> None:
    seconds = 100
    response = await user_app_client.post(
        "/tokens", json={"count": 5, "duration": seconds}
    )
    assert response.status_code == 200
    result = response.json()
    assert datetime.fromisoformat(result["expiration"]) < (
        datetime.utcnow() + timedelta(seconds=seconds)
    )
    assert len(result["tokens"]) == 5


@pytest.mark.asyncio
async def test_list_tokens(
    user_app_client: AsyncClient, fixture: Fixture
) -> None:
    tokens = [
        {
            "id": 1,
            "site_id": None,
            "value": "c54e5ba6-d214-40dd-b601-01ebb1019c07",
            "expiration": datetime.fromisoformat("2023-02-23T09:09:51.103703"),
        },
        {
            "id": 2,
            "site_id": None,
            "value": "b67c449e-fcf6-4014-887d-909859f9fb70",
            "expiration": datetime.fromisoformat("2023-02-23T11:28:54.382456"),
        },
    ]
    await fixture.create("tokens", tokens)
    response = await user_app_client.get("/tokens")
    assert response.status_code == 200
    assert response.json()["total"] == 2
    assert len(response.json()["items"]) == 2

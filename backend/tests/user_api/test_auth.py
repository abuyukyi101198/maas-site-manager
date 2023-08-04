from typing import Iterator

from fastapi import FastAPI
from fastapi.routing import APIRoute
import pytest

from ..fixtures.client import Client

AUTHENTICATED_ROUTES = [
    ("GET", "/requests"),
    ("POST", "/requests"),
    ("GET", "/sites"),
    ("GET", "/sites/coordinates"),
    ("GET", "/sites/{site_id}"),
    ("GET", "/tokens"),
    ("POST", "/tokens"),
    ("GET", "/tokens/export"),
    ("GET", "/users"),
    ("POST", "/users"),
    ("GET", "/users/me"),
    ("PATCH", "/users/me"),
    ("PATCH", "/users/me/password"),
    ("GET", "/users/{user_id}"),
    ("PATCH", "/users/{user_id}"),
    ("DELETE", "/users/{user_id}"),
]

UNAUTHENTICATED_ROUTES = [
    ("GET", "/"),
    ("POST", "/login"),
    ("GET", "/metrics"),
]

ADMIN_ROUTES = [
    ("GET", "/users"),
    ("POST", "/users"),
    ("GET", "/users/{id}"),
    ("DELETE", "/users/{id}"),
    ("PATCH", "/users/{id}"),
]


@pytest.fixture
def api_routes(api_app: FastAPI) -> Iterator[set[tuple[str, str]]]:
    routes = set()
    for route in api_app.routes:
        if not isinstance(route, APIRoute):
            continue
        for method in route.methods:
            routes.add((method, route.path))
    yield routes


def test_all_routes_checked(api_routes: set[tuple[str, str]]) -> None:
    assert api_routes == set(AUTHENTICATED_ROUTES + UNAUTHENTICATED_ROUTES)


@pytest.mark.asyncio
@pytest.mark.parametrize("method,url", AUTHENTICATED_ROUTES)
async def test_handler_auth_required(
    app_client: Client, method: str, url: str
) -> None:
    response = await app_client.request(method, url)
    assert (
        response.status_code == 401
    ), f"Auth should be required for {method} {url}"


@pytest.mark.asyncio
@pytest.mark.parametrize("method,url", UNAUTHENTICATED_ROUTES)
async def test_handler_auth_not_required(
    app_client: Client, method: str, url: str
) -> None:
    response = await app_client.request(method, url)
    assert not response.is_server_error
    assert (
        response.status_code != 401
    ), f"Auth should not be required for {method} {url}"


@pytest.mark.asyncio
@pytest.mark.parametrize("method,url", ADMIN_ROUTES)
async def test_handler_admin_required(
    user_client: Client, method: str, url: str
) -> None:
    response = await user_client.request(method, url)
    assert (
        response.status_code == 403
    ), f"Admin should be required for {method} {url}"

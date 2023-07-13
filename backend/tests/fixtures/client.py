from httpx import (
    AsyncClient,
    Response,
)


class Client(AsyncClient):
    """Equivalent to AsyncClient, but has the ability to send
    requests from an authorized login"""

    def __init__(self, **kwargs) -> None:  # type: ignore
        super().__init__(**kwargs)
        self._token = ""
        self._token_type = ""

    async def login(self, email: str, password: str) -> None:
        """login this client with the email and password"""
        response = await self.post(
            "/login", json={"email": email, "password": password}
        )
        assert (
            response.status_code == 200
        ), f"Could not login user: {response.text}"
        self._token = response.json()["access_token"]
        self._token_type = response.json()["token_type"].capitalize()

    @property
    def authenticated(self) -> bool:
        """Are we logged in?"""
        return bool(self._token)

    async def request(self, *args, **kwargs) -> Response:  # type: ignore
        """Generate a request with the authorized payload attached if the user
        has been logged in. All methods (get, post, push, ...) use this in
        the backend to construct their requests"""
        if self.authenticated:
            kwargs.update(
                {
                    "headers": {
                        "Authorization": f"{self._token_type} {self._token}"
                    },
                }
            )
        return await super().request(*args, **kwargs)

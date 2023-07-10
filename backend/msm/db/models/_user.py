from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    SecretStr,
)


class User(BaseModel):
    """A user."""

    id: int
    email: EmailStr = Field(title="email@example.com")
    username: str
    full_name: str
    is_admin: bool


class UserWithPassword(User):
    """A user with its password."""

    # use password.get_secret_value() to retrieve the value
    password: SecretStr = Field(min_length=8, max_length=100)


class UserCreate(BaseModel):
    """Creating a new user"""

    email: str
    username: str
    full_name: str
    password: str
    is_admin: bool


class UserUpdate(BaseModel):
    """User updatable fields"""

    username: str | None = None
    full_name: str | None = None
    email: str | None = None
    password: str | None = None
    is_admin: bool | None = None

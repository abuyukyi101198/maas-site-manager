from pydantic import Field
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)
from sqlalchemy import URL


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(case_sensitive=True)

    db_host: str = Field(default="localhost", validation_alias="MSM_DB_HOST")
    db_port: int | None = Field(default=None, validation_alias="MSM_DB_PORT")
    db_name: str = Field(default="msm", validation_alias="MSM_DB_NAME")
    db_user: str | None = Field(default=None, validation_alias="MSM_DB_USER")
    db_password: str | None = Field(
        default=None, validation_alias="MSM_DB_PASSWORD"
    )

    allowed_origins: list[str] = Field(
        default=[
            "http://localhost:8405",
            "http://127.0.0.1:8405",
            "http://[::1]:8405",
        ],
        validation_alias="MSM_ALLOWED_ORIGINS",
    )

    @property
    def db_dsn(self) -> URL:
        """The DSN, from configured settings."""
        return URL.create(
            "postgresql+asyncpg",
            host=self.db_host,
            database=self.db_name,
            username=self.db_user,
            password=self.db_password,
        )

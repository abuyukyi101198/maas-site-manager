from pydantic import (
    BaseSettings,
    Field,
    PostgresDsn,
)


class Settings(BaseSettings):
    """Application settings."""

    db_dsn: PostgresDsn = Field(
        default="postgresql+asyncpg://postgres:msm@localhost/msm",
        env="MSM_DB_DSN",
    )  # type: ignore

    allowed_origins: list[str] = Field(
        default=[
            "http://localhost:8405",
            "http://127.0.0.1:8405",
            "http://[::1]:8405",
        ],
        env="MSM_ALLOWED_ORIGINS",
    )

    token_secret_key: str = Field(default="", env="MSM_TOKEN_SECRET_KEY")


SETTINGS = Settings()

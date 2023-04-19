from pydantic import (
    BaseSettings,
    Field,
    PostgresDsn,
)


class Settings(BaseSettings):
    """API settings."""

    db_dsn: PostgresDsn = Field(
        default="postgresql+asyncpg://postgres:msm@localhost/msm",
        env="MSM_DB_DSN",
    )  # type: ignore

    default_page_size: int = Field(
        default=20, gte=1, env="MSM_DEFAULT_PAGE_SIZE"
    )

    max_page_size: int = Field(default=100, gte=1, env="MSM_MAX_PAGE_SIZE")

    allowed_origins: list[str] = Field(
        default=[
            "http://localhost:8405",
            "http://127.0.0.1:8405",
            "http://[::1]:8405",
        ],
        env="MSM_ALLOWED_ORIGINS",
    )


SETTINGS = Settings()

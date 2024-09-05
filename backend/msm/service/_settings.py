import os
from socket import gethostname

from msm.db import models
from msm.db.tables import Setting
from msm.service._base import DBBackedModelService
from msm.settings import Settings


class SettingsService(DBBackedModelService[models.Settings]):
    """Service to access global settings."""

    db_table = Setting

    async def get_service_url(self) -> str:
        model = await self.get()

        if model.service_url:
            return model.service_url

        settings = Settings()
        return os.environ.get(
            "MSM_BASE_PATH", f"http://{gethostname()}:{settings.api_port}"
        )

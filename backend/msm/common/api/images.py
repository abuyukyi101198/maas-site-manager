# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
Custom image API request and response models.
"""

from typing import Self

from pydantic import BaseModel

from msm.apiserver.db import models


class ImagesPostResponse(models.BootAssetItem):
    """Response model for posting custom images."""

    @classmethod
    def from_model(cls, model: models.BootAssetItem) -> Self:
        """Create an instance from a database model."""
        return cls(**model.model_dump())


class ImagesRemovePostRequest(BaseModel):
    """Request model for removing custom images."""

    asset_ids: list[int]

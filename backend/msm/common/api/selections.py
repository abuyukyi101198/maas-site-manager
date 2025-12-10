# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
Selections API request and response models.
"""

from pydantic import BaseModel

from msm.apiserver.db import models


class ImageSource(BaseModel):
    """A source of a boot asset."""

    selection_id: int
    id: int
    name: str
    url: str


class GetSelectableImagesResponse(BaseModel):
    """Response model for selectable images."""

    items: list[models.SelectableImage]


class GetSelectedImagesResponse(BaseModel):
    """Response model for selected images."""

    items: list[models.SelectedImage]


class GetImageSourcesResponse(BaseModel):
    """Response model for image sources."""

    items: list[ImageSource]


class SelectImagesPostRequest(BaseModel):
    """Request model for selecting images."""

    selection_ids: list[int]


class RemoveSelectedImagesPostRequest(BaseModel):
    """Request model for removing selected images."""

    selection_ids: list[int]

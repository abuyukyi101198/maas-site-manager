from typing import Self

from pydantic import BaseModel

from msm.db import models


class GetSelectableImagesResponse(BaseModel):
    items: list[models.SelectableImage]


class GetSelectedImagesResponse(BaseModel):
    items: list[models.SelectedImage]


class ImagesPostResponse(models.BootAssetItem):
    @classmethod
    def from_model(cls, model: models.BootAssetItem) -> Self:
        return cls(**model.model_dump())


class ImageSource(BaseModel):
    selection_id: int
    id: int
    name: str
    url: str


class GetImageSourcesResponse(BaseModel):
    items: list[ImageSource]


class SelectImagesPostRequest(BaseModel):
    selection_ids: list[int]


class RemoveSelectedImagesPostRequest(BaseModel):
    selection_ids: list[int]

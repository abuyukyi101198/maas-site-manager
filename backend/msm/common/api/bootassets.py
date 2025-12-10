# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
Boot asset API request and response models.
"""

from typing import Any, Self

from pydantic import AwareDatetime, BaseModel, Field, model_validator

from msm.apiserver.db import models
from msm.apiserver.schema import PaginatedResults
from msm.common.enums import BootAssetKind, BootAssetLabel, ItemFileType


class BootSourceGetResponse(models.BootSource):
    """Response model for a boot source."""

    @classmethod
    def from_model(cls, model: models.BootSource) -> Self:
        """Create an instance from a database model."""
        return cls(**model.model_dump())

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Self:
        """Create an instance from a dictionary."""
        return cls(**data)


class BootSourcePatchResponse(models.BootSource):
    """Response model for updating a boot source."""

    @classmethod
    def from_model(cls, model: models.BootSource) -> Self:
        """Create an instance from a database model."""
        return cls(**model.model_dump())


class BootSourcesGetResponse(PaginatedResults[models.BootSource]):
    """Response model for listing boot sources."""

    pass


class BootSourceSelectionsGetResponse(
    PaginatedResults[models.BootSourceSelection]
):
    """Response model for listing boot source selections."""

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Self:
        """Create an instance from a dictionary."""
        return cls(**data)


class BootSourcesPostRequest(BaseModel):
    """Request model for creating a boot source."""

    priority: int
    url: str
    keyring: str
    sync_interval: int
    name: str


class BootSourcesPostResponse(BaseModel):
    """Response model for creating a boot source."""

    id: int


class BootSourcesPatchRequest(BaseModel):
    """Request model for updating a boot source."""

    priority: int | None = None
    keyring: str | None = None
    sync_interval: int | None = Field(default=None, ge=0)
    name: str | None = None

    model_config = {"extra": "forbid"}

    @model_validator(mode="after")
    def check_at_least_one_field_present(self) -> Self:
        """ "Ensure at least one field is provided for update."""
        if not self.model_fields_set:
            raise ValueError("At least one field must be set.")
        return self


class AvailableBootSourceSelection(BaseModel):
    """Model representing an available selection."""

    os: str
    release: str
    label: BootAssetLabel
    arch: str

    def __eq__(self, other: Any) -> bool:
        return (self.os, self.release, self.arch) == (
            other.os,
            other.release,
            other.arch,
        )


class BootSourceAvailSelectionsPutRequest(BaseModel):
    """Request model for updating available selections."""

    available: list[AvailableBootSourceSelection]


class BootSourceAvailSelectionsPutResponse(BaseModel):
    """Response model for updating available selections."""

    stale: list[models.BootSourceSelection]


class BootAssetItemPatchRequest(BaseModel):
    """Request model for updating a boot asset item."""

    ftype: str | None = None
    source_package: str | None = None
    source_version: str | None = None
    source_release: str | None = None
    bytes_synced: int | None = None  # can only be changed by workers

    model_config = {"extra": "forbid"}

    @model_validator(mode="after")
    def check_at_least_one_field_present(self) -> Self:
        """ "Ensure at least one field is provided for update."""
        if not self.model_fields_set:
            raise ValueError("At least one field must be set.")
        return self


class BootAssetItemPatchResponse(models.BootAssetItem):
    """Response model for updating a boot asset item."""

    @classmethod
    def from_model(cls, model: models.BootAssetItem) -> Self:
        return cls(**model.model_dump())


class ProductItem(BaseModel):
    """Model representing a boot asset item in an upstream SimpleStream."""

    ftype: ItemFileType
    sha256: str
    path: str
    file_size: int
    source_package: str | None = None
    source_version: str | None = None
    source_release: str | None = None

    @classmethod
    def from_item(cls, asset: models.BootAssetItem) -> Self:
        """Create an instance from a database model."""
        return cls(**asset.model_dump())


class Product(BaseModel):
    """Model representing a boot asset product in an upstream SimpleStream."""

    kind: BootAssetKind
    label: BootAssetLabel
    os: str
    arch: str
    release: str | None = None
    version: str | None = None
    krel: str | None = None
    codename: str | None = None
    title: str | None = None
    subarch: str | None = None
    compatibility: list[str] | None = None
    flavor: str | None = None
    base_image: str | None = None
    bootloader_type: str | None = None
    eol: AwareDatetime | None = None
    esm_eol: AwareDatetime | None = None
    signed: bool = False
    versions: dict[str, list[ProductItem]]

    @model_validator(mode="after")
    def validate_krel_for_ubuntu(self) -> Self:
        if self.os and self.os.lower() == "ubuntu" and not self.krel:
            raise ValueError("krel is required for Ubuntu products")
        return self


class IdProduct(Product):
    """Product model with an ID."""

    id: int

    @classmethod
    def from_asset(cls, asset: models.BootAsset) -> Self:
        """Create an instance from a database model."""
        return cls(**asset.model_dump(), versions={})

    @classmethod
    def from_dict(cls, product: dict[str, Any]) -> Self:
        """Create an instance from a dictionary."""
        return cls(
            versions={
                ver: [
                    ProductItem(**{ikey: ival for ikey, ival in item.items()})
                    for item in items
                ]
                for ver, items in product["versions"].items()
            },
            **{
                pkey: pval
                for pkey, pval in product.items()
                if pkey != "versions"
            },
        )


class BootSourcesAssetsPutRequest(BaseModel):
    """Request model for updating a boot source's assets."""

    products: list[Product]


class BootSourcesAssetsPutResponse(BaseModel):
    """Response model for updating a boot source's assets."""

    to_download: list[int]


class VersionStatus(BaseModel):
    """Status of a boot asset version."""

    complete: bool
    last_seen: AwareDatetime


class AssetVersions(BaseModel):
    """Version statuses for a boot asset."""

    asset_id: int
    versions: dict[str, VersionStatus]

    @classmethod
    def from_dict(cls, versions: dict[str, Any]) -> Self:
        """Create an instance from a dictionary."""
        return cls(
            asset_id=versions["asset_id"],
            versions={
                v: VersionStatus(
                    complete=i["complete"],
                    last_seen=i["last_seen"],
                )
                for v, i in versions["versions"].items()
            },
        )


class BootSourceVersionsGetResponse(BaseModel):
    """Response model for getting boot asset versions."""

    versions: list[AssetVersions]


class BootAssetItemGetResponse(models.BootAssetItem):
    """Response model for getting a boot asset item."""

    @classmethod
    def from_model(cls, model: models.BootAssetItem) -> Self:
        """Create an instance from a database model."""
        return cls(**model.model_dump())

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Self:
        """Create an instance from a dictionary."""
        return cls(**data)


class Version(BaseModel):
    """Simplified version model."""

    asset_id: int
    version: str


class VersionsRemovePostRequest(BaseModel):
    """Request model for removing boot asset versions."""

    to_remove: list[Version]

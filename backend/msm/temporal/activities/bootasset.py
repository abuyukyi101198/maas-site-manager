# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
Boot asset management activities.
"""

from dataclasses import dataclass, field
from typing import Any

from pydantic import AwareDatetime
from temporalio import activity
from temporalio.exceptions import ApplicationError

from msm.common.api.bootassets import (
    AssetVersions,
    AvailableBootSourceSelection,
    BootAssetItemGetResponse,
    BootSourceAvailSelectionsPutRequest,
    BootSourceGetResponse,
    BootSourcesAssetsPutRequest,
    BootSourceSelectionsGetResponse,
)
from msm.common.enums import BootAssetLabel

from .base import BaseActivity, compose_url, get_selection_key
from .simplestream import AvailableAsset, Product

GET_BOOT_SOURCE_ACTIVITY = "get-boot-source"
GET_BOOT_ASSET_ITEM_ACTIVITY = "get-boot-asset-item"
PUT_AVAILABLE_ASSETS_ACTIVITY = "patch-available-asset-list"
PUT_NEW_ASSETS_ACTIVITY = "put-new-asset-list"
GET_SOURCE_VERSIONS_ACTIVITY = "get-source-versions"
REMOVE_STALE_VERSIONS_ACTIVITY = "remove-stale-versions"
GET_SOURCE_LAST_SYNC_ACTIVITY = "get-source-last-sync"


@dataclass
class GetBootSourceParams:
    """Parameters for retrieving boot source configuration.

    Args:
        msm_base_url: Base URL of the MSM API server.
        msm_jwt: JWT token for API authentication.
        boot_source_id: Unique identifier of the boot source to retrieve.
    """

    msm_base_url: str
    msm_jwt: str
    boot_source_id: int


@dataclass
class GetBootSourceResult:
    """Result containing boot source configuration and selections.

    Args:
        index_url: URL to the SimpleStream index for this boot source.
        keyring: Optional keyring file path for signature verification.
        selections: List of selection keys for enabled OS/release/arch combinations.
    """

    index_url: str
    keyring: str | None = None
    selections: list[str] = field(default_factory=list)


@dataclass
class PutAvailableAssetListParams:
    """Parameters for updating available assets in a boot source.

    Args:
        msm_base_url: Base URL of the MSM API server.
        msm_jwt: JWT token for API authentication.
        boot_source_id: Unique identifier of the boot source to update.
        available: List of available assets to publish to the boot source.
    """

    msm_base_url: str
    msm_jwt: str
    boot_source_id: int
    available: list[AvailableAsset]


@dataclass
class PutAssetListParams:
    """Parameters for updating existing or to-be-downloaded assets for a boot source.

    Args:
        msm_base_url: Base URL of the MSM API server.
        msm_jwt: JWT token for API authentication.
        boot_source_id: Unique identifier of the boot source to update.
        items: List of Product objects containing asset information and versions.
    """

    msm_base_url: str
    msm_jwt: str
    boot_source_id: int
    items: list[Product]


@dataclass
class GetSourceVersionsParams:
    """Parameters for retrieving all assets and their versions for a boot source.

    Args:
        msm_base_url: Base URL of the MSM API server.
        msm_jwt: JWT token for API authentication.
        boot_source_id: Unique identifier of the boot source to query.
    """

    msm_base_url: str
    msm_jwt: str
    boot_source_id: int


@dataclass
class GetSourceVersionsResult:
    """Result containing all assets and their versions for a boot source.

    Args:
        versions: List of AssetVersions.
    """

    versions: list[AssetVersions]


@dataclass
class RemoveStaleVersionsParams:
    """Parameters for cleaning up stale versions.

    Args:
        msm_base_url: Base URL of the MSM API server.
        msm_jwt: JWT token for API authentication.
        versions: List of AssetVersions to evaluate for staleness.
        versions_to_keep: Maximum number of complete versions to retain per asset.
        source_last_sync: Timestamp of the last successful sync from upstream,
                         used to determine if versions were removed from source.
    """

    msm_base_url: str
    msm_jwt: str
    versions: list[AssetVersions]
    versions_to_keep: int
    source_last_sync: AwareDatetime


@dataclass
class PutAssetListResult:
    """Result from uploading asset list indicating which items need downloading.

    Args:
        to_download: List of boot asset item IDs that need to be downloaded
                    to complete the asset synchronization process.
    """

    to_download: list[int]


@dataclass
class GetBootAssetItemParams:
    """Parameters for retrieving individual boot asset item details.

    Args:
        msm_base_url: Base URL of the MSM API server.
        msm_jwt: JWT token for API authentication.
        boot_asset_item_id: Unique identifier of the specific asset item.
    """

    msm_base_url: str
    msm_jwt: str
    boot_asset_item_id: int


@dataclass
class GetBootAssetItemResult:
    """Result containing boot asset item metadata and sync status.

    Args:
        path: Relative path to the asset file within the SimpleStream.
        sha256: SHA256 hash for integrity verification.
        file_size: Total size of the asset file in bytes.
        bytes_synced: Number of bytes already downloaded/synced.
    """

    path: str
    sha256: str
    file_size: int
    bytes_synced: int


@dataclass
class GetSourceLastSyncParams:
    """Parameters for retrieving a boot source's last synchronization timestamp.

    Args:
        msm_base_url: Base URL of the MSM API server.
        msm_jwt: JWT token for API authentication.
        boot_source_id: Unique identifier of the boot source to query.
    """

    msm_base_url: str
    msm_jwt: str
    boot_source_id: int


class BootAssetActivities(BaseActivity):
    """Temporal activities for managing boot asset sources and synchronization.

    Provides comprehensive functionality for boot asset lifecycle management including
    source configuration retrieval, asset discovery, version management, and cleanup
    operations. Handles both OS images and bootloader assets from SimpleStream sources.
    """

    async def _get_boot_source(
        self, msm_base_url: str, headers: dict[str, str], boot_source_id: int
    ) -> BootSourceGetResponse:
        """Retrieve boot source configuration from MSM API.

        Internal helper method for fetching boot source details including URL,
        keyring, and other configuration parameters.

        Args:
            msm_base_url: Base URL of the MSM API server.
            headers: HTTP headers including authentication.
            boot_source_id: Unique identifier of the boot source.

        Returns:
            BootSourceGetResponse containing the source configuration.

        Raises:
            ApplicationError: If the API request fails or returns non-200 status.
        """
        url = compose_url(
            msm_base_url,
            f"api/v1/bootasset-sources/{boot_source_id}",
        )
        response = await self.client.get(url, headers=headers)
        if response.status_code != 200:
            raise ApplicationError(
                f"Failed to get boot source: {response.status_code} {response.text}"
            )
        return BootSourceGetResponse.from_dict(response.json())

    @activity.defn(name=GET_BOOT_SOURCE_ACTIVITY)
    async def get_boot_source(
        self, params: GetBootSourceParams
    ) -> GetBootSourceResult:
        """Retrieve boot source configuration and active selections.

        Fetches the boot source configuration including SimpleStream URL and keyring,
        then retrieves the currently selected OS/release/architecture combinations
        that should be synchronized from the upstream source.

        Args:
            params: Parameters containing MSM API details and boot source ID.

        Returns:
            GetBootSourceResult with index URL, keyring, and selection keys.

        Raises:
            ApplicationError: If API requests fail or return unexpected status codes.
        """
        headers = self._get_header(params.msm_jwt)

        boot_source = await self._get_boot_source(
            params.msm_base_url, headers, params.boot_source_id
        )

        # get selections
        url = compose_url(
            params.msm_base_url,
            f"api/v1/bootasset-sources/{params.boot_source_id}/selections",
        )
        response = await self.client.get(url, headers=headers)
        if response.status_code != 200:
            raise ApplicationError(
                f"Failed to get asset selections: {response.status_code} {response.text}"
            )
        selection_response = BootSourceSelectionsGetResponse.from_dict(
            response.json()
        )
        selections = [
            get_selection_key(sel.os, sel.release, sel.arch)
            for sel in selection_response.items
            if sel.selected
        ]
        activity.logger.debug(
            "Boot source %d has %d selections",
            params.boot_source_id,
            len(selections),
        )

        return GetBootSourceResult(
            index_url=boot_source.url,
            keyring=boot_source.keyring,
            selections=selections,
        )

    @activity.defn(name=GET_BOOT_ASSET_ITEM_ACTIVITY)
    async def get_boot_asset_item(
        self, params: GetBootAssetItemParams
    ) -> GetBootAssetItemResult:
        """Retrieve metadata and sync status for a specific boot asset item.

        Fetches detailed information about an individual boot asset item including
        its path, integrity hash, total size, and current synchronization progress.
        Used primarily for download coordination and progress tracking.

        Args:
            params: Parameters containing MSM API details and asset item ID.

        Returns:
            GetBootAssetItemResult with file metadata and sync progress.

        Raises:
            ApplicationError: If the asset item doesn't exist or API request fails.
        """
        headers = self._get_header(params.msm_jwt)

        # get source
        url = compose_url(
            params.msm_base_url,
            f"api/v1/bootasset-items/{params.boot_asset_item_id}",
        )
        response = await self.client.get(url, headers=headers)
        if response.status_code != 200:
            raise ApplicationError(
                f"Failed to get boot asset item: {response.status_code} {response.text}"
            )
        item = BootAssetItemGetResponse.from_dict(response.json())

        return GetBootAssetItemResult(
            path=item.path,
            sha256=item.sha256,
            file_size=item.file_size,
            bytes_synced=item.bytes_synced,
        )

    @activity.defn(name=PUT_AVAILABLE_ASSETS_ACTIVITY)
    async def put_available_asset_list(
        self, params: PutAvailableAssetListParams
    ) -> bool:
        """Update the list of available selections for a boot source.

        Publishes the current list of available OS/release/architecture combinations
        that can be selected for synchronization from the upstream SimpleStream source.

        Args:
            params: Parameters containing the boot source ID and available assets list.

        Returns:
            True if the update was successful.

        Raises:
            ApplicationError: If the API request fails or returns non-200 status.
        """
        headers = self._get_header(params.msm_jwt)

        url = compose_url(
            params.msm_base_url,
            f"api/v1/bootasset-sources/{params.boot_source_id}/available-selections",
        )

        put_req = BootSourceAvailSelectionsPutRequest(
            available=[
                AvailableBootSourceSelection(
                    os=sel.os,
                    release=sel.release,
                    label=BootAssetLabel(sel.label),
                    arch=sel.arch,
                )
                for sel in params.available
            ]
        )

        response = await self.client.put(
            url, headers=headers, json=put_req.model_dump(mode="json")
        )

        if response.status_code != 200:
            raise ApplicationError(
                f"Failed to update available asset list: {response.status_code} {response.text}"
            )

        return True

    @activity.defn(name=PUT_NEW_ASSETS_ACTIVITY)
    async def put_asset_list(
        self, params: PutAssetListParams
    ) -> PutAssetListResult:
        """Upload the list of selected products to MSM.

        Args:
            params: Parameters containing the boot source ID and Product list.

        Returns:
            PutAssetListResult with IDs of asset items that need downloading.

        Raises:
            ApplicationError: If the API request fails or returns non-200 status.
        """
        headers = self._get_header(params.msm_jwt)

        url = compose_url(
            params.msm_base_url,
            f"api/v1/bootasset-sources/{params.boot_source_id}/assets",
        )

        put_req = BootSourcesAssetsPutRequest(
            products=[p for p in params.items]
        )

        response = await self.client.put(
            url, headers=headers, json=put_req.model_dump(mode="json")
        )

        if response.status_code != 200:
            raise ApplicationError(
                f"Failed to update assets: {response.status_code} {response.text}"
            )

        ret = response.json()["to_download"]
        return PutAssetListResult(to_download=ret)

    @activity.defn(name=GET_SOURCE_LAST_SYNC_ACTIVITY)
    async def get_source_last_sync(
        self, params: GetSourceLastSyncParams
    ) -> AwareDatetime:
        """Retrieve the timestamp of a boot source's last successful synchronization.

        Args:
            params: Parameters containing MSM API details and boot source ID.

        Returns:
            Timezone-aware datetime of the last successful sync operation.

        Raises:
            ApplicationError: If the boot source doesn't exist or API request fails.
        """
        headers = self._get_header(params.msm_jwt)
        boot_source = await self._get_boot_source(
            params.msm_base_url, headers, params.boot_source_id
        )
        return boot_source.last_sync

    @activity.defn(name=GET_SOURCE_VERSIONS_ACTIVITY)
    async def get_source_versions(
        self, params: GetSourceVersionsParams
    ) -> GetSourceVersionsResult:
        """Retrieve all assets and their versions for a particular boot source.

        Args:
            params: Parameters containing MSM API details and boot source ID.

        Returns:
            GetSourceVersionsResult with list of AssetVersions objects.

        Raises:
            ApplicationError: If the boot source doesn't exist or API request fails.
        """
        headers = self._get_header(params.msm_jwt)
        url = compose_url(
            params.msm_base_url,
            f"api/v1/bootasset-sources/{params.boot_source_id}/versions",
        )
        response = await self.client.get(url, headers=headers)
        if response.status_code != 200:
            raise ApplicationError(
                f"Failed to retrieve versions for source {params.boot_source_id}: {response.status_code} {response.text}"
            )
        versions = [
            AssetVersions.from_dict(a) for a in response.json()["versions"]
        ]
        return GetSourceVersionsResult(versions=versions)

    @activity.defn(name=REMOVE_STALE_VERSIONS_ACTIVITY)
    async def remove_stale_versions(
        self,
        params: RemoveStaleVersionsParams,
    ) -> None:
        """Remove stale asset versions based on upstream and retention policies.

        Implements a two-phase cleanup strategy:
        1. Removes versions that no longer exist upstream (last_seen < source_last_sync)
        2. Enforces retention limits by keeping only the newest N complete versions

        The cleanup process preserves version integrity by only removing complete
        versions when enforcing retention limits, ensuring that incomplete downloads
        are not counted against the retention limit until they finish.

        Args:
            params: Parameters containing version list, retention policy, and sync timestamp.

        Raises:
            ApplicationError: If the cleanup API request fails.
        """
        # first get rid of versions that have been removed from upstream
        versions_removed_from_up: list[tuple[int, dict[str, Any]]] = []
        for i, av in enumerate(params.versions):
            for v, vs in av.versions.items():
                if vs.last_seen < params.source_last_sync:
                    versions_removed_from_up.append(
                        (
                            i,
                            {
                                "asset_id": av.asset_id,
                                "version": v,
                            },
                        )
                    )

        for i, rv in versions_removed_from_up:
            params.versions[i].versions.pop(rv["version"])

        # next, check if we have more than required number of versions
        versions_to_remove = [v[1] for v in versions_removed_from_up]
        for av in params.versions:
            complete_versions = [
                v for v, s in av.versions.items() if s.complete
            ]
            if len(complete_versions) > params.versions_to_keep:
                stale = complete_versions[: -params.versions_to_keep]
                versions_to_remove += [
                    {"asset_id": av.asset_id, "version": v} for v in stale
                ]
        if versions_to_remove:
            headers = self._get_header(params.msm_jwt)
            url = compose_url(
                params.msm_base_url,
                "api/v1/bootasset-versions:remove",
            )
            response = await self.client.post(
                url, headers=headers, json={"to_remove": versions_to_remove}
            )
            if response.status_code != 200:
                raise ApplicationError(
                    f"Failed to remove stale versions {versions_to_remove}: {response.status_code} {response.text}"
                )
        else:
            activity.logger.debug("No stale versions to remove")

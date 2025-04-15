from dataclasses import dataclass
from os.path import join
import typing

import boto3  # type: ignore
from httpx import AsyncClient
from temporalio import activity

MIN_S3_PART_SIZE = 5 * 1024**2  # 5MiB
UPDATE_BYTES_SYNCED_ACTIVITY = "update-bytes-synced"
DOWNLOAD_ASSET_ACTIVITY = "download-asset"


@dataclass
class S3Params:
    endpoint: str
    access_key: str
    secret_key: str
    bucket: str
    path: str


@dataclass
class DownloadUpstreamImageParams:
    ss_url: str
    msm_url: str
    msm_jwt: str
    boot_asset_item_id: int
    s3_params: S3Params


@dataclass
class UpdateBytesSyncedParams:
    msm_url: str
    msm_jwt: str
    bytes_synced: int


@dataclass
class DownloadAssetParams:
    ss_url: str
    boot_asset_item_id: int
    s3_params: S3Params


class S3ResourceManager:
    def __init__(self, s3_params: S3Params, boot_asset_item_id: int) -> None:
        self.s3_resource = boto3.resource(
            "s3",
            use_ssl=False,
            verify=False,
            endpoint_url=s3_params.endpoint,
            aws_access_key_id=s3_params.access_key,
            aws_secret_access_key=s3_params.secret_key,
        )
        self.s3_key = join(s3_params.path, str(boot_asset_item_id))
        self.bucket = s3_params.bucket
        self.upload_id = self._create_multipart_upload()
        self.part_no = 1
        self.parts: list[dict[str, typing.Any]] = []
        self.bytes_sent = 0

    def _create_multipart_upload(self) -> str:
        multipart_upload = (
            self.s3_resource.meta.client.create_multipart_upload(
                ACL="public-read",
                Bucket=self.bucket,
                Key=self.s3_key,
                ChecksumAlgorithm="SHA256",
            )
        )
        return multipart_upload["UploadId"]  # type: ignore

    def upload_part(self, chunk: bytes) -> None:
        multipart_upload_part = self.s3_resource.MultipartUploadPart(
            self.bucket, self.s3_key, self.upload_id, self.part_no
        )
        part = multipart_upload_part.upload(
            Body=chunk,
            ChecksumAlgorithm="SHA256",
        )

        activity.heartbeat(f"Uploaded part {self.part_no}")
        self.parts.append({"ETag": part["ETag"], "PartNumber": self.part_no})
        self.part_no += 1
        self.bytes_sent += len(chunk)

    def complete_upload(self) -> None:
        self.s3_resource.meta.client.complete_multipart_upload(
            Bucket=self.bucket,
            Key=self.s3_key,
            UploadId=self.upload_id,
            MultipartUpload={"Parts": self.parts},
        )

    def abort_upload(self) -> None:
        self.s3_resource.meta.client.abort_multipart_upload(
            Bucket=self.bucket,
            Key=self.s3_key,
            UploadId=self.upload_id,
        )


class ImageManagementActivity:
    """
    Activities for image management
    """

    def __init__(self) -> None:
        self.client = self._create_client()

    def _create_client(self) -> AsyncClient:
        return AsyncClient()

    def _create_s3_manager(
        self, params: S3Params, item_id: int
    ) -> S3ResourceManager:
        return S3ResourceManager(params, item_id)

    @activity.defn(name=UPDATE_BYTES_SYNCED_ACTIVITY)
    async def update_bytes_synced(
        self, params: UpdateBytesSyncedParams
    ) -> int:
        msm_headers = {"Authorization": f"bearer {params.msm_jwt}"}
        new_item = {"bytes_synced": params.bytes_synced}
        response = await self.client.patch(
            params.msm_url, headers=msm_headers, json=new_item
        )
        return response.status_code

    @activity.defn(name=DOWNLOAD_ASSET_ACTIVITY)
    async def download_asset(self, params: DownloadAssetParams) -> int:
        s3_manager = self._create_s3_manager(
            params.s3_params, params.boot_asset_item_id
        )
        chunk = b""
        try:
            async with self.client.stream(
                "GET", params.ss_url, timeout=7200
            ) as r:
                async for data in r.aiter_bytes():
                    chunk += data
                    if len(chunk) >= MIN_S3_PART_SIZE:
                        s3_manager.upload_part(chunk)
                        chunk = b""
                # finalize upload
                if chunk:
                    s3_manager.upload_part(chunk)
                s3_manager.complete_upload()
        except:
            s3_manager.abort_upload()
            raise
        return s3_manager.bytes_sent

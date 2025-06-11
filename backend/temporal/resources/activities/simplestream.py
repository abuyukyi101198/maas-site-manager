from dataclasses import dataclass
import json
import typing

from activities.images import compose_url  # type: ignore
from httpx import AsyncClient
from management.utils import check_tree_paths, read_signed  # type: ignore
from temporalio import activity
from temporalio.exceptions import ApplicationError

BASE_ASSET_ATTRS = frozenset(
    [
        "arch",
        "bootloader-type",
        "kflavor",
        "label",
        "os",
        "release_codename",
        "release_title",
        "release",
        "subarch",
        "subarches",
        "support_eol",
        "support_esm_eol",
    ]
)

DOWNLOAD_SS_JSON_ACTIVITY = "download_simplestream-index"
GET_BOOT_SOURCE_ACTIVITY = "get-boot-source"
PARSE_SS_INDEX_ACTIVITY = "parse-simplestream-index"
LOAD_PRODUCT_MAP_ACTIVITY = "load-product-map"


@dataclass
class GetBootSourceParams:
    msm_base_url: str
    msm_jwt: str
    boot_source_id: int


@dataclass
class DownloadJsonParams:
    source_url: str
    keyring: str | None = None


@dataclass
class ParseSsIndexParams:
    index_url: str
    content: dict[str, typing.Any]


@dataclass
class LoadProductMapParams:
    products: dict[str, typing.Any]
    selections: dict[str, list[str]]
    canonical_source: bool


def get_selection_key(os: str, release: str) -> str:
    return f"{os}---{release}"


class SimpleStreamActivities:
    def __init__(self) -> None:
        self.client = self._create_client()

    def _create_client(self) -> AsyncClient:
        return AsyncClient(trust_env=True)

    def _get_header(self, jwt: str) -> dict[str, str]:
        return {"Authorization": f"bearer {jwt}"}

    @activity.defn(name=GET_BOOT_SOURCE_ACTIVITY)
    async def get_boot_source(
        self, params: GetBootSourceParams
    ) -> dict[str, typing.Any]:
        headers = self._get_header(params.msm_jwt)

        # get source
        url = compose_url(
            params.msm_base_url,
            f"api/v1/bootasset-sources/{params.boot_source_id}",
        )
        response = await self.client.get(url, headers=headers)
        if response.status_code != 200:
            raise ApplicationError(
                f"Failed to get boot source: {response.status_code} {response.text}"
            )
        boot_source = response.json()

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
        selections = {
            get_selection_key(sel["os"], sel["release"]): sel["arches"].split(
                ","
            )
            for sel in response.json()["items"]
        }

        return {
            "boot_source": boot_source,
            "selections": selections,
        }

    @activity.defn(name=DOWNLOAD_SS_JSON_ACTIVITY)
    async def download_json(
        self, params: DownloadJsonParams
    ) -> dict[str, typing.Any]:
        response = await self.client.get(
            params.source_url,
            timeout=7200,
        )
        if response.status_code != 200:
            raise ApplicationError(
                f"Failed to download JSON: {response.status_code} {response.text}"
            )
        content = response.text

        if params.source_url.endswith(".sjson"):
            signed_content, signed_by_cpc = await read_signed(
                content,
                keyring=params.keyring,
            )
            json_content = json.loads(signed_content)
        else:
            json_content = json.loads(content)
            signed_by_cpc = False

        return {
            "json": json_content,
            "signed_by_cpc": signed_by_cpc,
        }

    @activity.defn(name=PARSE_SS_INDEX_ACTIVITY)
    async def parse_ss_index(
        self, params: ParseSsIndexParams
    ) -> tuple[str, list[str]]:
        check_tree_paths(params.content, format="index:1.0")

        base_url = params.index_url
        for suffix in ["streams/v1/index.json", "streams/v1/index.sjson"]:
            base_url = base_url.removesuffix(suffix)

        products: list[str] = []

        for entry in params.content.get("index", {}).values():
            if entry.get("format") != "products:1.0":
                continue
            products.append(compose_url(base_url, entry["path"]))

        return base_url, products

    @activity.defn(name=LOAD_PRODUCT_MAP_ACTIVITY)
    async def load_product_map(
        self, params: LoadProductMapParams
    ) -> list[dict[str, typing.Any]]:
        target: list[dict[str, typing.Any]] = []

        source = params.products
        check_tree_paths(source, format="products:1.0")

        for product_data in source["products"].values():
            if "bootloader-type" not in product_data:
                key = get_selection_key(
                    product_data["os"], product_data["release"]
                )

                if key not in params.selections:
                    continue
                if product_data["arch"] not in params.selections[key]:
                    continue

            base_item = {
                k: product_data[k]
                for k in BASE_ASSET_ATTRS
                if k in product_data
            }

            version = sorted(product_data["versions"].keys())[-1]
            items = product_data["versions"][version]["items"]
            for asset in items.values():
                new_item = {
                    **base_item,
                    "sha256": asset["sha256"],
                    "path": asset["path"],
                    "file_size": asset["size"],
                    "ftype": asset["ftype"],
                    "source_package": asset.get("source_package", None),
                    "source_version": asset.get("source_version", None),
                    "source_release": asset.get("source_release", None),
                }
                target.append(new_item)

        return target

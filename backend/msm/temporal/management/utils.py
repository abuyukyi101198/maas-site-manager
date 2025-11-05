# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""Utility functions for MSM Temporal management operations."""

import asyncio
from collections.abc import Callable
import os
import tempfile
from typing import Any

PGP_SIGNED_MESSAGE_HEADER = "-----BEGIN PGP SIGNED MESSAGE-----"
PGP_SIGNATURE_HEADER = "-----BEGIN PGP SIGNATURE-----"
PGP_SIGNATURE_FOOTER = "-----END PGP SIGNATURE-----"

UBUNTU_CLOUDIMG_KEYRING = "/usr/share/keyrings/ubuntu-cloudimage-keyring.gpg"


class SignatureMissingException(Exception):
    """Raised when expected PGP signature is not found in content.

    This exception indicates that content was expected to be PGP-signed
    but no signature headers were found in the provided data.
    """

    pass


class SignatureInvalidException(Exception):
    """Raised when PGP signature verification fails.

    This exception indicates that while a signature was found, it could not
    be verified against the provided keyring, suggesting the content may
    have been tampered with or signed by an untrusted key.
    """

    pass


class UnsafeFilePathException(Exception):
    """Raised when a file path contains potentially dangerous components.

    This security-focused exception prevents path traversal attacks by
    detecting absolute paths, parent directory references, and other
    potentially unsafe path constructions in SimpleStream metadata.
    """

    pass


def assert_safe_path(path: str | None) -> None:
    """Validate that a file path is safe from traversal attacks.

    Performs comprehensive security validation on file paths to prevent
    directory traversal attacks and other path-based security vulnerabilities.
    This is critical when processing untrusted SimpleStream metadata that
    contains file paths.

    Security checks performed:
    - Rejects absolute paths (starting with '/')
    - Rejects paths starting with parent directory references ('..', '...')
    - Rejects paths containing parent directory traversal sequences
    - Allows empty/None paths (treated as safe)

    Args:
        path: File path to validate. None or empty string is considered safe.

    Raises:
        UnsafeFilePathException: If the path contains dangerous components
                                that could lead to directory traversal attacks.
    """
    if path == "" or path is None:
        return
    path = str(path)
    if os.path.isabs(path):
        raise UnsafeFilePathException(f"Path '{path}' is absolute path")

    for tok in (".." + os.path.sep, "..." + os.path.sep):
        if path.startswith(tok):
            raise UnsafeFilePathException(f"Path '{path}' starts with '{tok}'")

    for tok in (
        os.path.sep + ".." + os.path.sep,
        os.path.sep + "..." + os.path.sep,
    ):
        if tok in path:
            raise UnsafeFilePathException(f"Path '{path}' contains '{tok}'")


async def read_signed(
    content: str, keyring: str | None = None, check: bool = True
) -> tuple[str, bool]:
    """Parse and verify PGP-signed content, extracting the original message.

    This function handles the complete lifecycle of PGP-signed content processing:
    - Validates presence of PGP signature headers
    - Optionally verifies signatures against provided or default keyrings
    - Extracts and decodes the original signed content
    - Handles dash-escaped content within signed messages

    The function supports both custom keyrings and Ubuntu's default cloud image
    keyring for signature verification. When using the default keyring, it
    tracks whether content was signed by Canonical (CPC).

    Content format expected:
    ```
    -----BEGIN PGP SIGNED MESSAGE-----
    Hash: SHA256

    Original content here
    Dash-escaped lines start with "- "
    -----BEGIN PGP SIGNATURE-----
    <signature data>
    -----END PGP SIGNATURE-----
    ```

    Args:
        content: PGP-signed message content to process.
        keyring: Optional custom keyring content for verification. If None,
                uses Ubuntu's default cloud image keyring.
        check: Whether to perform signature verification. If False, only
              extracts content without cryptographic validation.

    Returns:
        Tuple of (extracted_content, signed_by_canonical) where:
        - extracted_content: Original message with PGP headers removed and
                           dash-escaping decoded
        - signed_by_canonical: True if signed with Ubuntu's default keyring

    Raises:
        SignatureMissingException: If content lacks required PGP headers.
        SignatureInvalidException: If signature verification fails (when check=True).
    """
    # ensure that content is signed by a key in keyring.
    # if no keyring given use default.
    signed_by_cpc = False

    if not content.startswith(PGP_SIGNED_MESSAGE_HEADER):
        raise SignatureMissingException("No signature found")

    if check:
        with tempfile.NamedTemporaryFile(mode="w+t") as key_file:
            if keyring:
                key_file.write(keyring)
                keypath = key_file.name
            else:
                keypath = UBUNTU_CLOUDIMG_KEYRING
                signed_by_cpc = True

            cmd = ["gpgv", f"--keyring={keypath}", "-"]
            sh = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            _, stderr = await sh.communicate(input=content.encode())
            if sh.returncode != 0:
                raise SignatureInvalidException(stderr)

    output: list[str] = []
    mode = "garbage"
    for line in content.splitlines():
        if line == PGP_SIGNED_MESSAGE_HEADER:
            mode = "header"
        elif mode == "header":
            if line != "":
                mode = "body"
        elif line == PGP_SIGNATURE_HEADER:
            mode = "signature"
        elif line == PGP_SIGNATURE_FOOTER:
            mode = "garbage"
        elif mode == "body":
            # dash-escaped content in body
            if line.startswith("- "):
                output.append(line[2:])
            else:
                output.append(line)

    output.append("")  # need empty line at end
    return "\n".join(output), signed_by_cpc


_UNSET = object()


def walk_products(
    tree: dict[str, Any],
    cb_product: Callable[[dict[str, Any], str], Any] | None = None,
    cb_version: Callable[[dict[str, Any], str, str], Any] | None = None,
    cb_item: Callable[[dict[str, Any], str, str, str], Any] | None = None,
    ret_finished: object = _UNSET,
) -> None:
    """Traverse a SimpleStream product tree with configurable callbacks.

    Provides a flexible tree walking mechanism for processing SimpleStream product
    hierarchies. The function supports three levels of callbacks corresponding to
    the SimpleStream structure: products -> versions -> items. Each callback level
    is optional and can be used independently or in combination.

    Tree structure processed:
    ```
    {
      "products": {
        "product_name": {
          "versions": {
            "version_name": {
              "items": {
                "item_name": { ... }
              }
            }
          }
        }
      }
    }
    ```

    Early termination: Any callback can return a specific value (ret_finished)
    to halt traversal immediately, enabling efficient searching and conditional
    processing.

    Args:
        tree: SimpleStream product tree dictionary to traverse.
        cb_product: Optional callback for product-level processing.
                   Signature: (product_data, product_name) -> Any
        cb_version: Optional callback for version-level processing.
                   Signature: (version_data, product_name, version_name) -> Any
        cb_item: Optional callback for item-level processing.
                Signature: (item_data, product_name, version_name, item_name) -> Any
        ret_finished: Sentinel value that, when returned by any callback,
                     immediately terminates traversal.
    """
    for prodname, proddata in tree["products"].items():
        if cb_product:
            ret = cb_product(proddata, prodname)
            if ret_finished != _UNSET and ret == ret_finished:
                return

        if (not cb_version and not cb_item) or "versions" not in proddata:
            continue

        for vername, verdata in proddata["versions"].items():
            if cb_version:
                ret = cb_version(verdata, prodname, vername)
                if ret_finished != _UNSET and ret == ret_finished:
                    return

            if not cb_item or "items" not in verdata:
                continue

            for itemname, itemdata in verdata["items"].items():
                ret = cb_item(itemdata, prodname, vername, itemname)
                if ret_finished != _UNSET and ret == ret_finished:
                    return


def check_tree_paths(tree: dict[str, Any], format: str) -> None:
    """Validate all file paths in a SimpleStream tree for security compliance.

    Performs comprehensive security validation on all file paths contained within
    a SimpleStream data structure. This function is critical for preventing
    directory traversal attacks when processing untrusted upstream metadata.

    Args:
        tree: SimpleStream data structure containing paths to validate.
        format: SimpleStream format specification. If not provided, attempts
               to extract from tree['format'] or defaults to 'products:1.0'.

    Raises:
        UnsafeFilePathException: If any path in the tree contains dangerous
                               components that could lead to security vulnerabilities.
        ValueError: If the format is not recognized or supported.

    Supported formats:
        - 'products:1.0': Full product hierarchy validation
        - 'index:1.0': Index entry path validation
    """
    format = format or tree.get("format", "products:1.0")

    if format == "products:1.0":
        walk_products(
            tree,
            cb_item=lambda item, x, y, z: assert_safe_path(item.get("path")),
        )
    elif format == "index:1.0":
        for entry in tree.get("index", {}).values():
            assert_safe_path(entry.get("path"))
    else:
        raise ValueError(
            f"Unknown format {format} for tree {tree.get('name', 'unknown')}"
        )

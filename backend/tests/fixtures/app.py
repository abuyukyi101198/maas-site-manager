from contextlib import contextmanager
from typing import (
    Any,
    Callable,
    Iterator,
)

from fastapi import FastAPI


@contextmanager
def override_dependencies(
    app: FastAPI,
    dependencies_map: dict[Callable[..., Any], Callable[..., Any]],
) -> Iterator[None]:
    """Context manager to override app dependencies in tests."""
    for orig_func, override_func in dependencies_map.items():
        app.dependency_overrides[orig_func] = override_func
    yield
    for orig_func in dependencies_map:
        del app.dependency_overrides[orig_func]

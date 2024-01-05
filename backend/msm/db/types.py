from collections.abc import Callable
from typing import Any

from sqlalchemy.types import UserDefinedType


class Point(UserDefinedType):  # type: ignore
    """
    The postgresql POINT
    https://www.postgresql.org/docs/current/datatype-geometric.html#DATATYPE-GEOMETRIC-POINTS
    """

    cache_ok = True

    def get_col_spec(self, **kw: Any) -> str:
        return "POINT"

    @property
    def python_type(self) -> type[tuple[Any, ...]]:
        return tuple

    def result_processor(
        self, dialect: Any, coltype: Any
    ) -> Callable[[Any], tuple[Any, ...] | None]:
        # convert the result to a plain tuple

        def convert(value: Any) -> tuple[Any, ...] | None:
            if value is None:
                return None
            return tuple(value)

        return convert

from re import compile
from typing import NamedTuple

from fastapi import (
    HTTPException,
    Query,
)
from starlette import status

REMOVE_SORT_SUFFIX_REGEX = compile("(-desc|-asc)$")


class SortParam(NamedTuple):
    """Sort parameter."""

    field: str
    asc: bool


class SortParamParser:
    def __init__(self, fields: list[str]):
        self.fields = fields

    def __call__(
        self,
        sort_by: str | None = Query(default=None, title="Sort by properties"),
    ) -> list[SortParam]:
        """
        Parse the sort_by query parameter such
        as ?sort_by=property1-desc,property2-asc.
        By default, it uses the ascending ordering
        if no -desc/-asc suffix is specified.
        """
        if not sort_by:
            return []
        sort_query_fields = [field.strip() for field in sort_by.split(",")]
        sort_params = []
        invalid_query_fields = []
        for sort_query_field in sort_query_fields:
            ascending_sort: bool = not sort_query_field.endswith("-desc")
            field_name: str = REMOVE_SORT_SUFFIX_REGEX.sub(
                "", sort_query_field
            )
            if field_name not in self.fields:
                invalid_query_fields.append(sort_query_field)
            else:
                sort_params.append(
                    SortParam(field=field_name, asc=ascending_sort)
                )

        if invalid_query_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Invalid sort fields.",
                    "fields": invalid_query_fields,
                },
            )

        if self._contains_duplicates(sort_params):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Duplicate sort parameters detected. Please "
                    "ensure that each sort parameter occurs at most once."
                },
            )

        return sort_params

    @staticmethod
    def _contains_duplicates(sort_params: list[SortParam]) -> bool:
        sort_params_set = set([param.field for param in sort_params])
        return len(sort_params) != len(sort_params_set)

from fastapi import HTTPException
import pytest

from msm.schema._sorting import SortParamParser


@pytest.mark.asyncio
class TestSortParamParser:
    @pytest.mark.parametrize(
        "sortable_params, sort_by_query_param, expected_results",
        [
            (
                ["name", "name_unique"],
                "name-asc,name_unique-desc",
                {"name": True, "name_unique": False},
            ),
            (
                ["name", "name_unique"],
                "name,name_unique",
                {"name": True, "name_unique": True},
            ),
            (["name", "name_unique"], " name ", {"name": True}),
            (["name"], "", {}),
        ],
    )
    async def test_valid(
        self,
        sortable_params: list[str],
        sort_by_query_param: str,
        expected_results: dict[str, bool],
    ) -> None:
        parser = SortParamParser(sortable_params)
        parsed_params = parser(sort_by_query_param)

        assert len(parsed_params) == len(expected_results)
        for parsed_param in parsed_params:
            assert parsed_param.field in expected_results
            assert expected_results[parsed_param.field] == parsed_param.asc

    @pytest.mark.parametrize(
        "sortable_params, sort_by_query_param, expected_invalid_fields",
        [
            (
                ["name", "name_unique"],
                "name-asctypo,name_unique-desctypo",
                ["name-asctypo", "name_unique-desctypo"],
            ),
            (["name"], "name,not_a_field", ["not_a_field"]),
            (["name"], "name,", [""]),
        ],
    )
    async def test_invalid_fields(
        self,
        sortable_params: list[str],
        sort_by_query_param: str,
        expected_invalid_fields: list[str],
    ) -> None:
        parser = SortParamParser(sortable_params)
        with pytest.raises(HTTPException) as execution_exception:
            parser(sort_by_query_param)

        assert (
            execution_exception.value.detail["fields"]  # type: ignore
            == expected_invalid_fields
        )

    @pytest.mark.parametrize(
        "sortable_params, sort_by_query_param",
        [
            (["name", "name_unique"], "name,name_unique,name"),
            (["name", "name_unique", "city"], "city,name,name"),
        ],
    )
    async def test_duplicated_fields(
        self, sortable_params: list[str], sort_by_query_param: str
    ) -> None:
        parser = SortParamParser(sortable_params)
        with pytest.raises(HTTPException) as execution_exception:
            parser(sort_by_query_param)

        assert (
            "Duplicate" in execution_exception.value.detail["message"]  # type: ignore
        )

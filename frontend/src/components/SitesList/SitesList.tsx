import { useEffect, useState } from "react";

import SitesTable from "./SitesTable";

import { useSitesQuery } from "@/hooks/react-query";
import useDebounce from "@/hooks/useDebouncedValue";
import usePagination from "@/hooks/usePagination";
import { parseSearchTextToQueryParams } from "@/utils";

const DEFAULT_PAGE_SIZE = 50;

const SitesList = () => {
  const [totalDataCount, setTotalDataCount] = useState(0);
  const { page, debouncedPage, size, handleNextClick, handlePreviousClick, handlePageSizeChange, setPage } =
    usePagination(DEFAULT_PAGE_SIZE, totalDataCount);
  const [searchText, setSearchText] = useState("");
  const debounceSearchText = useDebounce(searchText);

  const { error, data, isLoading } = useSitesQuery(
    { page: `${debouncedPage}`, size: `${size}` },
    parseSearchTextToQueryParams(debounceSearchText),
  );

  useEffect(() => {
    setPage(1);
  }, [searchText, setPage]);

  useEffect(() => {
    if (data && "total" in data) {
      setTotalDataCount(data.total);
    }
  }, [data]);

  return (
    <div>
      <SitesTable
        data={data}
        error={error}
        isLoading={isLoading}
        paginationProps={{
          currentPage: page,
          dataContext: "MAAS Regions",
          handlePageSizeChange,
          isLoading,
          itemsPerPage: size,
          onNextClick: handleNextClick,
          onPreviousClick: handlePreviousClick,
          setCurrentPage: setPage,
          totalItems: data?.total || 0,
        }}
        setSearchText={setSearchText}
      />
    </div>
  );
};

export default SitesList;

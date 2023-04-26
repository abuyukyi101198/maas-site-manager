import { useState } from "react";

import useDebouncedValue from "./useDebouncedValue";

function usePagination(pageSize: number, totalItems: number) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const debouncedPage = useDebouncedValue(page);

  const handleNextClick = () => {
    const maxPage = totalItems > 0 ? totalItems / size : 1;
    setPage((prev) => (prev >= maxPage ? maxPage : prev + 1));
  };

  const handlePreviousClick = () => {
    setPage((prev) => (prev === 1 ? 1 : prev - 1));
  };

  const resetPageCount = () => setPage(1);

  const handlePageSizeChange = (size: number) => {
    setSize(size);
    resetPageCount();
  };

  return {
    page: page,
    size,
    setPage,
    debouncedPage: debouncedPage,
    handleNextClick,
    handlePreviousClick,
    handlePageSizeChange,
    totalItems,
  };
}

export default usePagination;

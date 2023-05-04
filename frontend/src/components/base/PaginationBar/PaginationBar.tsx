import type { ChangeEvent } from "react";
import { useMemo } from "react";

import { Select } from "@canonical/react-components";

import type { AppPaginationProps } from "@/components/base/TablePagination/TablePagination";
import TablePagination from "@/components/base/TablePagination/TablePagination";

export type PaginationBarProps = AppPaginationProps & {
  handlePageSizeChange: (size: number) => void;
  dataContext: string;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
};

const PaginationBar = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onNextClick,
  onPreviousClick,
  handlePageSizeChange,
  dataContext,
  setCurrentPage,
  isLoading,
}: PaginationBarProps) => {
  const pageCounts = useMemo(() => [20, 30, 50], []);
  const pageOptions = useMemo(
    () => pageCounts.map((pageCount) => ({ label: `${pageCount}/page`, value: pageCount })),
    [pageCounts],
  );

  const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    handlePageSizeChange(Number(value));
  };

  const getDisplayedDataCount = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage === totalPages) {
      return itemsPerPage - (totalPages * itemsPerPage - totalItems);
    } else if (currentPage < totalPages) {
      return itemsPerPage;
    } else {
      return 0;
    }
  };

  return (
    <section className="pagination-bar u-flex u-flex--justify-between u-flex--wrap">
      <strong className="pagination-bar__description">
        Showing {getDisplayedDataCount()} out of {totalItems} {dataContext}
      </strong>

      <div className="u-flex u-flex--wrap u-flex--column-x-small pagination-bar__right">
        <TablePagination
          currentPage={currentPage}
          isLoading={isLoading}
          itemsPerPage={itemsPerPage}
          onNextClick={onNextClick}
          onPreviousClick={onPreviousClick}
          setCurrentPage={setCurrentPage}
          totalItems={totalItems}
        />

        <Select
          aria-label="Tokens per page"
          name="Tokens per page"
          onChange={handleSizeChange}
          options={pageOptions}
          value={itemsPerPage}
        />
      </div>
    </section>
  );
};

export default PaginationBar;

import { useState, useEffect } from "react";

import { Col, Row } from "@canonical/react-components";

import EnrollmentActions from "@/components/EnrollmentActions";
import RequestsTable from "@/components/RequestsTable";
import PaginationBar from "@/components/base/PaginationBar";
import { useRequestsQuery } from "@/hooks/react-query";
import usePagination from "@/hooks/usePagination";

const DEFAULT_PAGE_SIZE = 50;
const Requests: React.FC = () => {
  const [totalDataCount, setTotalDataCount] = useState(0);
  const { page, debouncedPage, size, handleNextClick, handlePreviousClick, handlePageSizeChange, setPage } =
    usePagination(DEFAULT_PAGE_SIZE, totalDataCount);
  const { error, data, isLoading } = useRequestsQuery({
    page: `${debouncedPage}`,
    size: `${size}`,
  });

  useEffect(() => {
    if (data && "total" in data) {
      setTotalDataCount(data.total);
    }
  }, [data]);

  return (
    <section>
      <EnrollmentActions />
      <Row>
        <Col size={12}>
          <PaginationBar
            currentPage={page}
            dataContext="open enrolment requests"
            handlePageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
            itemsPerPage={size}
            onNextClick={handleNextClick}
            onPreviousClick={handlePreviousClick}
            setCurrentPage={setPage}
            totalItems={data?.total || 0}
          />
        </Col>
        <Col size={12}>
          <RequestsTable data={data} error={error} isLoading={isLoading} />
        </Col>
      </Row>
    </section>
  );
};

export default Requests;

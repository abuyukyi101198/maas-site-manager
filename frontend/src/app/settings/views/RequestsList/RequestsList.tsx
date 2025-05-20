import { ContentSection } from "@canonical/maas-react-components";

import { useEnrollmentRequests } from "@/app/api/query/enrollmentRequests";
import PaginationBar from "@/app/base/components/PaginationBar";
import usePagination from "@/app/base/hooks/usePagination";
import EnrollmentActions from "@/app/settings/views/RequestsList/components/EnrollmentActions";
import RequestsTable from "@/app/settings/views/RequestsList/components/RequestsTable";

const DEFAULT_PAGE_SIZE = 50;
const Requests: React.FC = () => {
  const { page, debouncedPage, size, handlePageSizeChange, setPage } = usePagination(DEFAULT_PAGE_SIZE);
  const { error, data, isPending } = useEnrollmentRequests({
    query: {
      page: debouncedPage,
      size,
    },
  });
  return (
    <ContentSection>
      <ContentSection.Header>
        <EnrollmentActions />
        <PaginationBar
          currentPage={page}
          dataContext="open enrollment requests"
          handlePageSizeChange={handlePageSizeChange}
          isPending={isPending}
          itemsPerPage={size}
          setCurrentPage={setPage}
          totalItems={data?.total || 0}
        />
      </ContentSection.Header>
      <ContentSection.Content>
        <RequestsTable currentPage={page} data={data} error={error} isPending={isPending} pageSize={size} />
      </ContentSection.Content>
    </ContentSection>
  );
};

export default Requests;

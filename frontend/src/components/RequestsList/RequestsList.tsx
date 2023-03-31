import { useState } from "react";

import { Col, Row } from "@canonical/react-components";

import EnrollmentActions from "@/components/EnrollmentActions";
import RequestsTable from "@/components/RequestsTable";
import { useRequestsQuery } from "@/hooks/api";

const Requests: React.FC = () => {
  // TODO: update page and size when pagination is implemented
  // https://warthogs.atlassian.net/browse/MAASENG-1525
  const [page] = useState<number>(0);
  const [size] = useState<number>(50);
  const { data, isLoading, isFetchedAfterMount } = useRequestsQuery({ page: `${page}`, size: `${size}` });
  return (
    <section>
      <EnrollmentActions />
      <Row>
        <Col size={12}>
          <RequestsTable data={data} isFetchedAfterMount={isFetchedAfterMount} isLoading={isLoading} />
        </Col>
      </Row>
    </section>
  );
};

export default Requests;

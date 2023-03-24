import { Button, Col, Row } from "@canonical/react-components";

import { useAppContext } from "@/context";

const TokensList = () => {
  const { setSidebar } = useAppContext();

  return (
    <section>
      <Row>
        <Col size={2}>
          <h2 className="p-heading--4">Tokens</h2>
        </Col>
      </Row>
      <Row>
        <Col size={12}>
          <div className="u-flex u-flex--justify-end">
            <Button>Export</Button>
            <Button appearance="negative">Delete</Button>
            <Button className="p-button--positive" onClick={() => setSidebar("createToken")} type="button">
              Generate tokens
            </Button>
          </div>
        </Col>
      </Row>
    </section>
  );
};

export default TokensList;

import { Notification } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

import type { PostEnrollmentRequestsData } from "@/api/handlers";

const EnrollmentNotification = ({ accept }: Partial<PostEnrollmentRequestsData>) => {
  const navigate = useNavigate();
  return (
    <Notification
      actions={[{ label: "Go to Regions", onClick: () => navigate("/sites") }]}
      role="alert"
      severity="information"
      title={accept ? "Accepted" : "Denied"}
    >
      {accept ? "Accepted" : "Denied"} enrolment request for maas-example-region. See more data of this region in the
      Regions page.
    </Notification>
  );
};

export default EnrollmentNotification;

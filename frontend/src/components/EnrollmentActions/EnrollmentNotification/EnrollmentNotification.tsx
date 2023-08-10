import { Notification } from "@canonical/react-components";
import pluralize from "pluralize";

import type { PendingSitesPostRequest } from "@/api-client/models/PendingSitesPostRequest";
import { useNavigate } from "@/utils/router";

const EnrollmentNotification = ({ accept, ids }: Partial<PendingSitesPostRequest>) => {
  const navigate = useNavigate();
  return (
    <Notification
      actions={[{ label: "Go to Regions", onClick: () => navigate("/sites") }]}
      role="alert"
      severity="information"
      title={accept ? "Accepted" : "Denied"}
    >
      {accept ? "Accepted" : "Denied"} enrolment request for {pluralize("MAAS regions", ids?.length, true)}. See more
      data of this region in the Regions page.
    </Notification>
  );
};

export default EnrollmentNotification;

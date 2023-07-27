import type { Site } from "@/api/types";
import { getTimeInTimezone, getTimezoneUTCString } from "@/utils";

const LocalTime = ({ timezone }: { timezone: Site["timezone"] }) => {
  return (
    <>
      {getTimeInTimezone(new Date(), timezone)} UTC{getTimezoneUTCString(timezone)}
    </>
  );
};

export default LocalTime;

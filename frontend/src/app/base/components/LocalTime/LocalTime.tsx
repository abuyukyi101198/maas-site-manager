import type { TimeZone } from "@/app/apiclient";
import { getTimeInTimezone, getTimezoneUTCString } from "@/utils";

const LocalTime = ({ timezone }: { timezone: TimeZone | "" }) => {
  return (
    <>
      {getTimeInTimezone(new Date(), timezone)} UTC{getTimezoneUTCString(timezone)}
    </>
  );
};

export default LocalTime;

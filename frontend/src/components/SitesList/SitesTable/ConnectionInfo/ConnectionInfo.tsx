import classNames from "classnames";
import get from "lodash/get";

import type { Site } from "@/api/types";
import docsUrls from "@/base/docsUrls";
import ExternalLink from "@/components/ExternalLink";
import TooltipButton from "@/components/base/TooltipButton";

export const connectionIcons: Record<Site["connection"], string> = {
  stable: "is-stable",
  lost: "is-lost",
  unknown: "is-unknown",
} as const;
export const connectionLabels: Record<Site["connection"], string> = {
  stable: "Stable",
  lost: "Lost",
  unknown: "Waiting for first",
} as const;

type ConnectionInfoProps = { connection: Site["connection"]; lastSeen?: Site["last_seen"] };

const ConnectionInfo = ({ connection, lastSeen }: ConnectionInfoProps) => (
  <>
    <TooltipButton
      iconName=""
      message={
        connection === "unknown" ? (
          "Haven't received a heartbeat from this region yet"
        ) : connection === "stable" ? (
          "Received a heartbeat in the expected interval of 5 minutes"
        ) : (
          <>
            Haven't received a heartbeat in the expected interval of 5 minutes.
            <br />
            <ExternalLink to={docsUrls.troubleshooting}>
              Check the documentation for troubleshooting steps.
            </ExternalLink>
          </>
        )
      }
      position="btm-center"
    >
      <div className={classNames("connection__text", "status-icon", get(connectionIcons, connection))}>
        {get(connectionLabels, connection)}
      </div>
    </TooltipButton>
    <div className="connection__text u-text--muted">{lastSeen}</div>
  </>
);
export default ConnectionInfo;

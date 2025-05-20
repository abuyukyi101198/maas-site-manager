import { Icon } from "@canonical/react-components";

import type { Image } from "@/app/api";
import Placeholder from "@/app/base/components/Placeholder";

const SyncedStatus = () => {
  return (
    <div>
      <Icon aria-hidden="true" name="success" /> Synced to MAAS sites
    </div>
  );
};

const QueuedStatus = () => (
  <div>
    <Icon aria-hidden="true" className="u-animation--spin" name="spinner" /> Queued for download
  </div>
);

const DownloadingStatus = ({ image }: { image: Image }) => (
  <div>
    <Icon aria-hidden="true" className="u-animation--spin" name="spinner" /> Downloading {image.downloaded}%
  </div>
);

const syncStatusComponents = {
  synced: SyncedStatus,
  queued: QueuedStatus,
  downloading: DownloadingStatus,
};

type Status = keyof typeof syncStatusComponents;
type SyncStatusProps = { status: Status; image: Image };
const SyncStatus = ({ status, image }: SyncStatusProps) => {
  const StatusComponent = syncStatusComponents[status];
  return StatusComponent ? <StatusComponent image={image} /> : null;
};

const getImageStatus = (image: Image): Status | null => {
  if (image.downloaded === 0) {
    return "queued";
  } else if (image.downloaded < 100) {
    return "downloading";
  } else if (image.downloaded === 100) {
    return "synced";
  }
  return null;
};

const SyncStatusContainer = ({ image }: { image: Image }) => {
  const status = getImageStatus(image);
  return status ? <SyncStatus image={image} status={status} /> : <Placeholder isPending />;
};

export default SyncStatusContainer;

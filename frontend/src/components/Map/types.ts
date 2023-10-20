import type { LatLngExpression } from "leaflet";

import type { Site } from "@/api/types";

export type SiteMarkerType = Pick<Site, "id"> & {
  position: LatLngExpression;
};

export type MapProps = {
  markers: SiteMarkerType[] | null;
  onBoundsChange?: (bounds: string) => void;
};

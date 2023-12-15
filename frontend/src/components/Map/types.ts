import type { Site } from "@/api/types";

export type SiteMarkerType = Pick<Site, "id"> & {
  // Latitute, longitude
  position: [number, number];
};

export type MapProps = {
  markers: SiteMarkerType[] | null;
  onBoundsChange?: (bounds: string) => void;
};

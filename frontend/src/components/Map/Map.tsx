import type { LeafletEventHandlerFn } from "leaflet";
import type { MapContainerProps } from "react-leaflet";
import { MapContainer, TileLayer, ZoomControl, useMapEvents } from "react-leaflet";

import SiteMarker from "./SiteMarker";
import { type SiteMarkerType } from "./types";

import { useAppLayoutContext } from "@/context";
import { useRegionDetailsContext } from "@/context/RegionDetailsContext";

const MapEvents = ({ onEvent }: { onEvent: LeafletEventHandlerFn }) => {
  useMapEvents({
    zoomend: onEvent,
    moveend: onEvent,
  });
  return null;
};

const Map = ({
  id = "map-container",
  markers,
  onBoundsChange,
}: MapContainerProps & {
  markers: SiteMarkerType[] | null;
  onBoundsChange?: (bounds: string) => void;
}) => {
  const { setSidebar } = useAppLayoutContext();
  const { setSelected: setRegionId } = useRegionDetailsContext();
  const handleMarkerClick = (id: SiteMarkerType["id"]) => {
    setRegionId(id);
    setSidebar("regionDetails");
  };

  return (
    <MapContainer
      boundsOptions={{
        // TODO: set the correct padding to accomodate for SitesTableControls and the sidebar
        paddingTopLeft: [50, 0],
      }}
      center={[0, 0]}
      className="map"
      id={id}
      zoom={3}
      zoomControl={false}
    >
      <MapEvents
        onEvent={(e) => {
          onBoundsChange?.(e.target.getBounds().toBBoxString());
        }}
      />
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        data-testid="tile-layer"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers?.map(({ position, id }) => (
        <SiteMarker handleMarkerClick={handleMarkerClick} id={id} key={id} position={position} />
      ))}
    </MapContainer>
  );
};

export default Map;

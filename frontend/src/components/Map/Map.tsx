import useLocalStorageState from "use-local-storage-state";

import MarkersLayer from "./MarkersLayer";
import { naturalEarth, osm } from "./styleSpecs";
import type { MapProps } from "./types";
import { getGeoJson } from "./utils";

import MapContainer from "@/components/Map/MapContainer";

const Map: React.FC<MapProps> = ({ markers }) => {
  const [hasAcceptedOsmTos] = useLocalStorageState("hasAcceptedOsmTos", { storageSync: true });
  const [style] = useState<maplibregl.StyleSpecification>(hasAcceptedOsmTos ? osm : naturalEarth);
  const customAttribution =
    style === osm ? `<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>` : undefined;
  const initialOptions: maplibregl.MapOptions = {
    customAttribution,
    container: "map",
    style,
    dragRotate: false,
    trackResize: true,
    center: [0, 0],
    zoom: 3,
    maxZoom: 17,
  };
  const geojson = useMemo(() => (markers ? getGeoJson(markers) : null), [markers]);

  return (
    <MapContainer className="map" initialOptions={initialOptions}>
      {geojson ? <MarkersLayer geojson={geojson} /> : null}
    </MapContainer>
  );
};

export default Map;

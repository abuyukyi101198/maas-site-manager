import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";

import { MapContextProvider } from "@/context/MapContext";
import useWindowSize from "@/hooks/useWindowSize";
import { computeMinZoom } from "@/utils";

interface MapContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialOptions: maplibregl.MapOptions;
}

/**
 * Sets up a map and adds it to the Context Provider.
 *
 * @note Changes to initialOptions are not reflected in the map after initialization.
 */
const MapContainer: React.FC<MapContainerProps> = ({ children, initialOptions, ...props }) => {
  const { screenHeight, screenWidth } = useWindowSize();
  const minZoom = useMemo(() => computeMinZoom({ screenHeight, screenWidth }), [screenHeight, screenWidth]);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const mapRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null && map === null) {
        const newMap = new maplibregl.Map({ ...initialOptions, minZoom, container: node });
        setMap(newMap);
      }
    },
    [map, initialOptions, minZoom],
  );

  // Update map zoom on change
  useEffect(() => {
    if (map && minZoom) {
      map.setMinZoom(minZoom);
    }
  }, [map, minZoom]);

  useEffect(() => {
    if (!map) return;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    return () => {
      map?.remove?.();
    };
  }, [map]);

  return (
    <div ref={mapRef} {...props}>
      {map && <MapContextProvider map={map}>{children}</MapContextProvider>}
    </div>
  );
};

export default MapContainer;

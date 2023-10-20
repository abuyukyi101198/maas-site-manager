import type L from "leaflet";

import { useLeafletMap } from "@/context/LeafletMapContext";
type MapEvents = {
  [key in keyof L.LeafletEventHandlerFnMap]?: (event: L.LeafletEvent) => void;
};

export const useMapEvents = (events: MapEvents) => {
  const map = useLeafletMap();

  useEffect(() => {
    map.on(events);
    return () => {
      map.off(events);
    };
  }, [map, events]);
};

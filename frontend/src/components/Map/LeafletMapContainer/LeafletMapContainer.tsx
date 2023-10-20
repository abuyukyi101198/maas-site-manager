import React, { useCallback, useState, useRef } from "react";

import type { MapOptions, FitBoundsOptions, Control } from "leaflet";
import { Map as LeafletMap, control } from "leaflet";

import { LeafletMapContextProvider } from "@/context/LeafletMapContext";

interface LeafletMapContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  options: MapOptions & { boundsOptions: FitBoundsOptions; zoomControlOptions?: Control.ZoomOptions };
}

/**
 * Sets up a leaflet map and adds it to the LeafletMapContextProvider.
 *
 * @note Changes to options, except for minZoom, are not reflected in the map after initialization.
 */
const LeafletMapContainer: React.FC<LeafletMapContainerProps> = ({
  children,
  options: { boundsOptions, zoomControlOptions, ...leafletOptions },
  ...props
}) => {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const { className } = props;

  const mapRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null && map === null) {
        const newMap = new LeafletMap(node, {
          ...leafletOptions,
          ...(zoomControlOptions ? { zoomControl: false } : {}),
        });
        if (leafletOptions.center != null && leafletOptions.zoom != null) {
          newMap.setView(leafletOptions.center, leafletOptions.zoom);
        } else if (leafletOptions.maxBounds && boundsOptions) {
          newMap.fitBounds(leafletOptions.maxBounds, boundsOptions);
        }
        const zoom = control.zoom(zoomControlOptions);
        zoom.addTo(newMap);
        setMap(newMap);
        mapNodeRef.current = node;
      }
    },
    [map, leafletOptions, boundsOptions, zoomControlOptions],
  );

  // Update map zoom on change
  useEffect(() => {
    if (map && leafletOptions.minZoom) {
      map.setMinZoom(leafletOptions.minZoom);
    }
  }, [map, leafletOptions.minZoom]);

  useEffect(() => {
    return () => {
      map?.remove();
    };
  }, [map]);

  return (
    <div className={className} ref={mapRef}>
      {map ? <LeafletMapContextProvider map={map}>{children}</LeafletMapContextProvider> : null}
    </div>
  );
};

export default LeafletMapContainer;

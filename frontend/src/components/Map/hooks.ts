import { useCallback, useEffect, useRef, useState } from "react";

import { useThrottle } from "@canonical/react-components";
import maplibregl from "maplibre-gl";

import { getSiteMarker, createCustomClusterIcon, getClusterSize } from "@/components/Map/SiteMarker";
import { useMap } from "@/context/MapContext";

type Feature = maplibregl.MapGeoJSONFeature;
type Features = maplibregl.MapGeoJSONFeature[];
type Markers = Record<number, maplibregl.Marker>;

export type MarkerProps = {
  marker: maplibregl.Marker;
  properties: Feature["properties"];
  coords: [number, number];
};

type ClusterProps = {
  maxCount: number;
};

type MarkerEventHandlers = Record<
  string,
  ({ marker, properties, coords }: MarkerProps) => (e: globalThis.MouseEvent) => void
> & {
  click?: ({
    marker,
    properties,
    coords,
  }: MarkerProps) => (e: globalThis.KeyboardEvent | globalThis.KeyboardEvent) => void;
};

type UseMarkers = {
  eventHandlers: MarkerEventHandlers;
};

export const useMarkers = ({ eventHandlers }: UseMarkers) => {
  const map = useMap();
  const markers = useRef<Markers>({});
  const markersOnScreen = useRef<Markers>({});

  const getClustersMaxCount = useCallback((features: Features) => {
    return features.reduce((maxCount, { properties }) => {
      if (properties?.cluster) {
        const count = properties.point_count;
        return count > maxCount ? count : maxCount;
      }
      return maxCount;
    }, 0);
  }, []);

  const handleClusterClick = useCallback(
    ({ coords, properties }: Pick<MarkerProps, "coords" | "properties">) => {
      (map.getSource("markers") as maplibregl.GeoJSONSource).getClusterExpansionZoom(
        properties.cluster_id,
        (err, zoom) => {
          if (err || zoom == null) return;
          map.easeTo({
            center: coords,
            zoom,
          });
        },
      );
    },
    [map],
  );

  const addEventHandlers = useCallback(
    (element: HTMLDivElement, eventHandlers: MarkerEventHandlers, markerProps: MarkerProps) => {
      const keypressHandler = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          eventHandlers.click?.(markerProps)(e);
        }
      };
      Object.keys(eventHandlers).forEach((eventName) => {
        element.addEventListener(eventName, eventHandlers[eventName]!(markerProps) as EventListener);
        // allow the same action to be triggered by both mouse click and by pressing the "Enter" key on the keyboard
        if (eventName === "click") {
          element.addEventListener("keypress", keypressHandler);
        }
      });
    },
    [],
  );

  const createNewMarker = useCallback(
    ({ coords, properties }: Pick<MarkerProps, "coords" | "properties">) => {
      const element = getSiteMarker("base");
      const marker = new maplibregl.Marker({
        element,
        anchor: "bottom",
      }).setLngLat(coords);
      addEventHandlers(element, eventHandlers, { marker, properties, coords });

      return marker;
    },
    [addEventHandlers, eventHandlers],
  );

  const createNewClusterMarker = useCallback(
    ({ coords, properties, maxCount }: Pick<MarkerProps, "coords" | "properties"> & ClusterProps) => {
      const element = createCustomClusterIcon("base", properties.point_count, maxCount);
      const marker = new maplibregl.Marker({
        element,
        anchor: "center",
      }).setLngLat(coords);

      const handleClusterKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          handleClusterClick({ properties, coords });
        }
      };

      element.addEventListener("keypress", handleClusterKeyPress);
      element.addEventListener("click", () => {
        handleClusterClick({ properties, coords });
      });

      return marker;
    },
    [handleClusterClick],
  );

  const removeUnusedMarkers = useCallback((markersToDelete: Markers) => {
    for (const id in markersOnScreen.current) {
      if (!markersToDelete[id]) {
        markersOnScreen.current[id].remove();
        delete markersOnScreen.current[id];
      }
    }
  }, []);

  const updateClusterMarker = useCallback(
    ({ marker, properties, maxCount }: Pick<MarkerProps, "marker" | "properties"> & ClusterProps) => {
      const clusterIcon = marker.getElement().firstElementChild as HTMLElement;
      const newSize = `${getClusterSize(properties.point_count, maxCount)}px`;
      clusterIcon.style.width = newSize;
      clusterIcon.style.height = newSize;
      return marker;
    },
    [],
  );

  const generateMarkers = useCallback(
    ({ features, maxCount }: { features: Features } & ClusterProps) => {
      const newMarkers: Markers = {};
      for (const { geometry, properties } of features) {
        const coords =
          "coordinates" in geometry && geometry.coordinates.length === 2
            ? (geometry.coordinates as [number, number])
            : null;
        const id = properties.id || properties.cluster_id;
        if (!coords) {
          throw new Error(`Error: The feature does not have coordinates: ${JSON.stringify({ geometry, properties })}`);
        }
        let marker = markers.current[id];
        if (!marker && coords.length === 2) {
          marker = properties.cluster
            ? createNewClusterMarker({ coords, properties, maxCount })
            : createNewMarker({ coords, properties });
          markers.current[id] = marker;
        } else if (properties.cluster) {
          marker = updateClusterMarker({ marker, properties, maxCount });
        }
        newMarkers[id] = marker;
      }
      return newMarkers;
    },
    [createNewMarker, createNewClusterMarker, updateClusterMarker],
  );

  const renderMarkers = useCallback(
    (newMarkers: Markers) => {
      for (const id in newMarkers) {
        if (!markersOnScreen.current[id]) {
          newMarkers[id].addTo(map);
        }
      }
      markersOnScreen.current = newMarkers;
    },
    [map],
  );

  const updateMarkers = useCallback(() => {
    if (map) {
      requestAnimationFrame(() => {
        const features = map.querySourceFeatures("markers");
        if (features) {
          const maxCount = getClustersMaxCount(features);
          const newMarkers = generateMarkers({ features, maxCount });
          removeUnusedMarkers(newMarkers);
          renderMarkers(newMarkers);
        }
      });
    }
  }, [map, getClustersMaxCount, generateMarkers, removeUnusedMarkers, renderMarkers]);

  const throttledUpdateMarkers = useThrottle(updateMarkers, 100);

  useEffect(() => {
    if (map) {
      map.on("sourcedata", (e) => {
        if (e.sourceId !== "markers") return;
        // repaint to ensure relative sizes for currently visible clusters
        updateMarkers();
      });
      map.on("move", throttledUpdateMarkers);
      map.on("moveend", updateMarkers);
    }

    return () => {
      if (map) {
        map.off("move", throttledUpdateMarkers);
        map.off("moveend", updateMarkers);
      }
    };
  }, [map, updateMarkers, throttledUpdateMarkers]);

  return markersOnScreen.current;
};

export const usePopup = () => {
  const popupRef = useRef<HTMLElement>(null);
  const [popup, setPopup] = useState<{ id: number; coords: [number, number] } | null>(null);
  const { withDelay, resetDelay } = useWithDelay();

  const showPopup = ({ id, coords }: { id: number; coords: MarkerProps["coords"] }) => {
    resetDelay();
    withDelay(() => setPopup({ id, coords }));
  };

  const hidePopup = ({ isImmediate = false }: { isImmediate?: boolean } = {}) => {
    resetDelay();
    if (isImmediate) {
      setPopup(null);
    } else {
      withDelay(() => setPopup(null));
    }
  };

  const handleMouseEnter = () => {
    resetDelay();
  };

  return { popupRef, popup, showPopup, hidePopup, handleMouseEnter };
};

const MARKER_HOVER_DELAY = 750;
export const useWithDelay = (delay = MARKER_HOVER_DELAY) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();
  const resetDelay = () => clearTimeout(timeoutRef.current);

  const withDelay = (fn: () => any) => {
    resetDelay();
    timeoutRef.current = setTimeout(fn, delay);
  };

  return { withDelay, resetDelay };
};

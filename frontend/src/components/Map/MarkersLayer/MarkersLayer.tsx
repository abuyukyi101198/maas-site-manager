import { useEffect, useRef, useState, useCallback } from "react";

import L from "leaflet";
import ReactDOM from "react-dom";

import { getSiteMarker } from "@/components/Map/SiteMarker";
import SiteSummary from "@/components/Map/SiteSummary";
import type { MapProps, SiteMarkerType } from "@/components/Map/types";
import { useAppLayoutContext } from "@/context";
import { useLeafletMap } from "@/context/LeafletMapContext";
import { useSiteDetailsContext } from "@/context/SiteDetailsContext";

const MARKER_HOVER_DELAY = 750;

const usePopupContainer = () => {
  return useMemo(() => {
    const popupContainer = document.createElement("div");
    popupContainer.setAttribute("class", "popup-container");
    return popupContainer;
  }, []);
};

const MarkersLayer = ({ markers }: MapProps) => {
  const map = useLeafletMap();
  const { setSidebar } = useAppLayoutContext();
  const { setSelected: setSiteId } = useSiteDetailsContext();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const resetTimeout = () => clearTimeout(timeoutRef.current);
  const [sitePopupId, setSitePopupId] = useState<number | null>(null);
  const popup = usePopupContainer();

  const handleMarkerClick = useCallback(
    async (e: L.LeafletEvent, id: SiteMarkerType["id"]) => {
      // immediately close the popup as there's no way of preventing this behaviour
      setTimeout(() => e.target.closePopup?.());
      setSiteId(id);
      setSidebar("siteDetails");
    },
    [setSiteId, setSidebar],
  );

  // update markers
  useEffect(() => {
    if (!markers) return;
    // set default marker icon
    L.Marker.prototype.options.icon = getSiteMarker("base");

    // create markers group
    const markersGroup = L.layerGroup();
    markers.forEach((marker) => {
      const leafletMarker = L.marker(marker.position);
      leafletMarker.on("click", (event) => {
        handleMarkerClick(event, marker.id);
      });
      leafletMarker.on("keypress", (event) => {
        handleMarkerClick(event, marker.id);
      });
      leafletMarker.bindPopup(popup);
      leafletMarker.on("mouseover", () => {
        timeoutRef.current = setTimeout(() => {
          leafletMarker.openPopup();
        }, MARKER_HOVER_DELAY);
      });
      leafletMarker.on("mouseout", (e) => {
        resetTimeout();
        if (e.originalEvent.relatedTarget !== popup?.firstElementChild) {
          leafletMarker.closePopup();
        }
      });
      leafletMarker.on("popupopen", () => {
        setSitePopupId(marker.id);
      });
      leafletMarker.addTo(markersGroup);
    });

    markersGroup.addTo(map);

    // remove the markers group when markers change
    return () => {
      map.removeLayer(markersGroup);
    };
  }, [map, popup, markers, handleMarkerClick]);

  return (
    <div>
      {ReactDOM.createPortal(
        sitePopupId ? (
          <SiteSummary
            id={sitePopupId}
            onMouseLeave={() => {
              map?.closePopup();
            }}
          />
        ) : null,
        popup,
      )}
    </div>
  );
};

export default MarkersLayer;

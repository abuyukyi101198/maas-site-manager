import { createContext, useContext } from "react";

import type { Map } from "maplibre-gl";

const MapContext = createContext<{ map: Map | null }>({
  map: null,
});

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context.map) {
    throw new Error("useMap must be used within a MapContextProvider");
  }
  return context.map;
};

export const MapContextProvider: React.FC<{ map: Map; children: React.ReactNode }> = ({ map, children }) => (
  <MapContext.Provider value={{ map }}>{children}</MapContext.Provider>
);

import type { FC, PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { Map } from "leaflet";

const LeafletMapContext = createContext<{ map: Map | null }>({
  map: null,
});

export const useLeafletMap = () => {
  const context = useContext(LeafletMapContext);
  if (!context.map) {
    throw new Error("useLeafletMap must be used within a LeafletMapContextProvider");
  }
  return context.map;
};

export const LeafletMapContextProvider: FC<PropsWithChildren<{ map: Map }>> = ({ map, children }) => (
  <LeafletMapContext.Provider value={{ map }}>{children}</LeafletMapContext.Provider>
);

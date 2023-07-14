import { createContext, useContext, useState } from "react";

export const AppLayoutContext = createContext<{
  sidebar: "removeRegions" | "createToken" | null;
  setSidebar: (sidebar: "removeRegions" | "createToken" | null) => void;
}>({
  sidebar: null,
  setSidebar: () => null,
});

export const AppLayoutContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [sidebar, setSidebar] = useState<"removeRegions" | "createToken" | null>(null);

  return <AppLayoutContext.Provider value={{ sidebar, setSidebar }}>{children}</AppLayoutContext.Provider>;
};

export const useAppLayoutContext = () => useContext(AppLayoutContext);

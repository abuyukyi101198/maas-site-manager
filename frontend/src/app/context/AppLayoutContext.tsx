import { createContext, useContext, useState } from "react";

import { usePrevious } from "@canonical/react-components";

export type Sidebar =
  | "addBootSource"
  | "addUser"
  | "createToken"
  | "deleteBootSource"
  | "deleteImages"
  | "deleteOrKeepImages"
  | "deleteUser"
  | "downloadImages"
  | "editBootSource"
  | "editCustomImagesSource"
  | "editSite"
  | "editUser"
  | "removeSites"
  | "siteDetails"
  | "siteSelect"
  | "sitesMissingData"
  | "uploadImage"
  | null;

export const AppLayoutContext = createContext<{
  previousSidebar: Sidebar;
  sidebar: Sidebar;
  setSidebar: (sidebar: Sidebar) => void;
}>({
  previousSidebar: null,
  sidebar: null,
  setSidebar: () => null,
});

export const AppLayoutContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [sidebar, setSidebar] = useState<Sidebar>(null);
  const previousSidebar = usePrevious<Sidebar>(sidebar);

  return (
    <AppLayoutContext.Provider value={{ previousSidebar, sidebar, setSidebar }}>{children}</AppLayoutContext.Provider>
  );
};

export const useAppLayoutContext = () => useContext(AppLayoutContext);

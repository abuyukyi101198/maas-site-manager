import { createContext, useContext, useState } from "react";

import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table";

export const AppContext = createContext<{
  rowSelection: RowSelectionState;
  setRowSelection: OnChangeFn<RowSelectionState>;
  sidebar: "removeRegions" | "createToken" | null;
  setSidebar: (sidebar: "removeRegions" | "createToken" | null) => void;
}>({
  rowSelection: {},
  setRowSelection: () => ({}),
  sidebar: null,
  setSidebar: () => null,
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sidebar, setSidebar] = useState<"removeRegions" | "createToken" | null>(null);

  return (
    <AppContext.Provider value={{ rowSelection, setRowSelection, sidebar, setSidebar }}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

import type { PropsWithChildren } from "react";
import React, { createContext, useContext, useState } from "react";

import type { OnChangeFn } from "@tanstack/react-table";

export type Entity = "bootSource" | "siteDetails" | "userSelection";

type SelectedEntityContextValue<T extends number | string | null = null> = {
  selected: T | null;
  setSelected: OnChangeFn<T | null>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ContextsCache = new Map<Entity, React.Context<any>>();

export const getSelectedEntityContext = <T extends number | string | null = null>(
  entity: Entity,
): React.Context<SelectedEntityContextValue<T>> => {
  if (!ContextsCache.has(entity)) {
    ContextsCache.set(
      entity,
      createContext<SelectedEntityContextValue<T>>({
        selected: null,
        setSelected: () => null,
      }),
    );
  }
  return ContextsCache.get(entity)!;
};

export const useSelectedEntityContext = <T extends number | string | null = null>(
  entity: Entity,
): SelectedEntityContextValue<T> => {
  const SelectedEntityContext = getSelectedEntityContext<T>(entity);
  return useContext(SelectedEntityContext);
};

export const getSelectedEntityContextProvider =
  <T extends number | string | null = null>(entity: Entity) =>
  ({ children }: PropsWithChildren<object>) => {
    const SelectedEntityContext = getSelectedEntityContext<T>(entity);
    const [selected, setSelected] = useState<T | null>(null);

    return (
      <SelectedEntityContext.Provider value={{ selected, setSelected }}>{children}</SelectedEntityContext.Provider>
    );
  };

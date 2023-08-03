import { getSelectedEntityContext, getSelectedEntityContextProvider, useSelectedEntityContext } from "./utils";

import type { Site } from "@/api/types";

export const RegionDetailsContextProvider = getSelectedEntityContextProvider<Site["id"]>("regionDetails");
export const RegionDetailsContext = getSelectedEntityContext<Site["id"]>("regionDetails");
export const useRegionDetailsContext = () => useSelectedEntityContext<Site["id"]>("regionDetails");
export type RegionDetailsContextValue = ReturnType<typeof useRegionDetailsContext>;

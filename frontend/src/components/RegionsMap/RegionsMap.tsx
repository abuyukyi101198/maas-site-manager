import { useState } from "react";

import Map from "@/components/Map";
import SitesHiddenButton from "@/components/Map/SitesHiddenButton/SitesHiddenButton";
import SitesTableControls from "@/components/SitesList/SitesTable/SitesTableControls/SitesTableControls";
import { useSitesCoordinatesQuery } from "@/hooks/react-query";
import useDebounce from "@/hooks/useDebouncedValue";
import { formatSiteMarker, parseSearchTextToQueryParams } from "@/utils";

const RegionsMap = () => {
  const [searchText, setSearchText] = useState("");
  const debounceSearchText = useDebounce(searchText);

  const { data, isLoading } = useSitesCoordinatesQuery(parseSearchTextToQueryParams(debounceSearchText));

  return (
    <div className="regions-map">
      <div className="regions-map__controls-wrapper">
        <SitesTableControls
          isLoading={isLoading}
          setSearchText={setSearchText}
          totalSites={data?.items?.length ?? null}
        />
      </div>
      <section aria-label="regions map">
        <Map markers={data?.items?.map?.(formatSiteMarker) ?? null} />
      </section>
      <SitesHiddenButton />
    </div>
  );
};

export default RegionsMap;

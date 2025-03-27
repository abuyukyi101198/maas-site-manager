import { useState } from "react";

import { ContentSection } from "@canonical/maas-react-components";

import Map from "@/components/Map";
import SitesHiddenButton from "@/components/Map/SitesHiddenButton/SitesHiddenButton";
import SitesTableControls from "@/components/SitesList/SitesTable/SitesTableControls/SitesTableControls";
import { useSitesCoordinatesQuery } from "@/hooks/react-query";
import { formatSiteMarker } from "@/utils";

const SitesMap = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const { data, isPending } = useSitesCoordinatesQuery();

  if (isFirstVisit) {
    setIsFirstVisit(false);
  }

  return (
    <ContentSection className="sites-map">
      <ContentSection.Header className="sites-map__controls-wrapper">
        <SitesTableControls isPending={isPending} totalSites={data?.length ?? null} />
      </ContentSection.Header>
      <section aria-label="sites map">
        {/* Make sure to  filter out sites without coordinates, otherwise they get rendered at 0,0 */}
        <Map markers={data?.filter((site) => site.coordinates).map?.(formatSiteMarker) ?? null} />
      </section>
      {data?.some((site) => site.coordinates === null) ? <SitesHiddenButton /> : null}
    </ContentSection>
  );
};

export default SitesMap;

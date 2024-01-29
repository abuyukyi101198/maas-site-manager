import { MainToolbar } from "@canonical/maas-react-components";
import { SearchBox } from "@canonical/react-components";
import classNames from "classnames";

import SitesCount from "./SitesCount";
import SitesViewControl from "./SitesViewControl";

import RemoveButton from "@/components/base/RemoveButton";
import { useAppLayoutContext } from "@/context/AppLayoutContext";
import { useRowSelection } from "@/context/RowSelectionContext/RowSelectionContext";
import type { UseSitesQueryResult } from "@/hooks/react-query";
import { useLocation } from "@/utils/router";

const SitesTableControls = ({
  totalSites,
  isPending,
  setSearchText,
  searchText,
}: {
  setSearchText: (text: string) => void;
  totalSites: number | null;
  searchText: string;
} & Pick<UseSitesQueryResult, "isPending">) => {
  const handleSearchInput = (inputValue: string) => {
    setSearchText(inputValue);
  };
  const { pathname } = useLocation();
  const { setSidebar } = useAppLayoutContext();
  const { rowSelection } = useRowSelection("sites");
  const isRemoveDisabled = Object.keys(rowSelection).length <= 0;
  const isMapView = pathname === "/sites/map";

  return (
    <span className={classNames("sites-table-controls", { "is-map-view": isMapView })}>
      <MainToolbar>
        <MainToolbar.Title>
          <SitesCount isPending={isPending} totalSites={totalSites} />
        </MainToolbar.Title>
        <MainToolbar.Controls>
          <SearchBox
            aria-label="Search and filter"
            className="sites-table-controls__search"
            externallyControlled
            onChange={handleSearchInput}
            placeholder="Search and filter"
            value={searchText}
          />
          <span className="remove-button__wrapper">
            <RemoveButton
              disabled={isRemoveDisabled}
              onClick={() => setSidebar("removeSites")}
              showDeleteIcon
              type="button"
            />
          </span>
          <SitesViewControl />
        </MainToolbar.Controls>
      </MainToolbar>
    </span>
  );
};

export default SitesTableControls;

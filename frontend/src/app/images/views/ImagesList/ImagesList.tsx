import type { ReactElement } from "react";

import { MainToolbar, ContentSection } from "@canonical/maas-react-components";
import { Button } from "@canonical/react-components";

import ImagesTable from "../../components/ImagesTable";

import RemoveButton from "@/app/base/components/RemoveButton";
import { useAppLayoutContext, useRowSelection } from "@/app/context";

const ImagesList = (): ReactElement => {
  const { rowSelection } = useRowSelection("images");
  const isDeleteDisabled = Object.keys(rowSelection).length <= 0;
  const { setSidebar } = useAppLayoutContext();

  return (
    <ContentSection>
      <ContentSection.Header>
        <MainToolbar>
          <MainToolbar.Title>Images</MainToolbar.Title>
          <MainToolbar.Controls>
            <RemoveButton
              disabled={isDeleteDisabled}
              label="Remove available images"
              onClick={() => {
                setSidebar("removeAvailableImages");
              }}
              type="button"
            />
            <Button
              onClick={() => {
                setSidebar("addToAvailableImages");
              }}
              type="button"
            >
              Add to available images
            </Button>
            <Button
              onClick={() => {
                setSidebar("uploadCustomImage");
              }}
              type="button"
            >
              Upload custom image
            </Button>
          </MainToolbar.Controls>
        </MainToolbar>
      </ContentSection.Header>
      <ContentSection.Content>
        <ImagesTable />
      </ContentSection.Content>
    </ContentSection>
  );
};

export default ImagesList;

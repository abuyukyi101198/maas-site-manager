import { ContentSection, MainToolbar } from "@canonical/maas-react-components";
import { Button } from "@canonical/react-components";

import ImageSourceListTable from "./ImageSourceListTable";
import type { BootSource } from "./types";

import { useAppLayoutContext } from "@/context";

export const fakeBootSources: { items: BootSource[] } = {
  items: [
    {
      id: 0,
      url: "custom",
      keyring: "",
      sync_interval: 0,
      priority: 1,
      status: "connected",
      total_images: 100,
    },
    {
      id: 1,
      url: "https://images.maas.io",
      keyring: "abcdefghijklmnopqrstuvwxyz",
      sync_interval: 300,
      priority: 2,
      status: "connected",
      total_images: 100,
    },
    {
      id: 2,
      url: "https://somewhere-else.long-domain-name.abc.xyz",
      keyring: "abcdefghijklmnopqrstuvwxyz",
      sync_interval: 150,
      priority: 3,
      status: "unreachable",
      total_images: 100,
    },
    {
      id: 3,
      url: "http://another-really-long-name.a-domain-somewhere.abc.xyz",
      keyring: "abcdefghijklmnopqrstuvwxyz",
      sync_interval: 0,
      priority: 4,
      status: "gpg_error",
      total_images: 100,
    },
  ],
};

const ImageSourceList = () => {
  const { setSidebar } = useAppLayoutContext();

  return (
    <ContentSection>
      <ContentSection.Header>
        <MainToolbar>
          <MainToolbar.Title>Source</MainToolbar.Title>
          <MainToolbar.Controls>
            <Button appearance="positive" onClick={() => setSidebar("addBootSource")}>
              Add image source
            </Button>
          </MainToolbar.Controls>
        </MainToolbar>
      </ContentSection.Header>
      <ContentSection.Content>
        <ImageSourceListTable data={fakeBootSources} error={null} isPending={false} />
      </ContentSection.Content>
    </ContentSection>
  );
};

export default ImageSourceList;

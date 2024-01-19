import { ContentSection } from "@canonical/maas-react-components";
import { Button } from "@canonical/react-components";

import {
  useSelectUpstreamImagesMutation,
  useUpstreamImageSourceMutation,
  useUpstreamImagesQuery,
} from "@/hooks/react-query";

const DownloadImages = () => {
  // TODO: replace test buttons with actual form https://warthogs.atlassian.net/browse/MAASENG-2565
  useUpstreamImagesQuery({ page: 1, size: 10 });

  const updateUpstreamImageSource = useUpstreamImageSourceMutation();
  const selectUpstreamImages = useSelectUpstreamImagesMutation();

  return (
    <ContentSection>
      <ContentSection.Title>Download images</ContentSection.Title>
      <ContentSection.Content>
        <Button
          onClick={() =>
            updateUpstreamImageSource.mutate({
              upstreamSource: "https://images.example.com",
              keepUpdated: true,
              credentials: "someCredentials",
            })
          }
        >
          Update upstream image source
        </Button>
        <Button
          onClick={() =>
            selectUpstreamImages.mutate([
              {
                id: 1,
                download: true,
              },
              {
                id: 2,
                download: true,
              },
              {
                id: 3,
                download: false,
              },
            ])
          }
        >
          Select upstream images
        </Button>
      </ContentSection.Content>
    </ContentSection>
  );
};

export default DownloadImages;

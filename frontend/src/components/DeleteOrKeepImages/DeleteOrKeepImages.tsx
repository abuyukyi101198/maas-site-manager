import { ContentSection } from "@canonical/maas-react-components";
import { Button } from "@canonical/react-components";

const DeleteOrKeepImages = () => {
  return (
    <ContentSection>
      <ContentSection.Title>Delete images</ContentSection.Title>
      <ContentSection.Content>
        Do you want to delete images which have previously been downloaded from maas.io or keep them? This will also
        affect connected MAAS sites.
      </ContentSection.Content>
      <ContentSection.Footer>
        {/* TODO: https://warthogs.atlassian.net/browse/MAASENG-2601 */}
        <Button appearance="negative">Delete images</Button>
        <Button appearance="positive">Keep images</Button>
      </ContentSection.Footer>
    </ContentSection>
  );
};

export default DeleteOrKeepImages;

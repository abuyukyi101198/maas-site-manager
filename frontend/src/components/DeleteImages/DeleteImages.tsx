import { ContentSection } from "@canonical/maas-react-components";
import { Button } from "@canonical/react-components";
import pluralize from "pluralize";

import { useAppLayoutContext, useRowSelection } from "@/context";

export const DeleteImages = ({ count }: { count?: number }) => {
  const imagesCountText = pluralize("image", count || 0, true);
  return (
    <ContentSection>
      <ContentSection.Title>Delete {imagesCountText}</ContentSection.Title>
      <ContentSection.Content>
        Are you sure you want to delete {imagesCountText}? This will also affect connected MAAS sites.
      </ContentSection.Content>
      <ContentSection.Footer>
        <Button type="button" variant="negative">
          Delete {imagesCountText}
        </Button>
      </ContentSection.Footer>
    </ContentSection>
  );
};

const DeleteImagesContainer = () => {
  const { rowSelection } = useRowSelection("images");
  const imagesCount = Object.keys(rowSelection).length;
  const { setSidebar } = useAppLayoutContext();

  // close sidebar when there are no images selected
  useEffect(() => {
    if (!imagesCount) {
      setSidebar(null);
    }
  }, [imagesCount, setSidebar]);

  return <DeleteImages count={imagesCount} />;
};

export default DeleteImagesContainer;

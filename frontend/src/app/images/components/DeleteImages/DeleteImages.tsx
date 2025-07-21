import { ContentSection } from "@canonical/maas-react-components";
import { Button, Notification } from "@canonical/react-components";
import type { RowSelectionState } from "@tanstack/react-table";
import pluralize from "pluralize";

import { useDeleteImagesMutation } from "@/app/base/hooks/react-query";
import { useAppLayoutContext, useRowSelection } from "@/app/context";

export const DeleteImages = ({
  count,
  error,
  onCancel,
  onDelete,
}: {
  count?: number;
  error?: InstanceType<ErrorConstructor> | unknown;
  onCancel: () => void;
  onDelete: () => void;
}) => {
  const imagesCountText = pluralize("image", count || 0, true);
  return (
    <ContentSection>
      <ContentSection.Title>Delete {imagesCountText}</ContentSection.Title>
      <ContentSection.Content>
        {error ? (
          <Notification severity="negative" title="Delete failed">
            {error instanceof Error ? error.message : "An unknown error occured."}
          </Notification>
        ) : null}
        Are you sure you want to delete <strong>{imagesCountText}</strong>? This will also affect connected MAAS sites.
      </ContentSection.Content>
      <ContentSection.Footer>
        <Button appearance="base" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button appearance="negative" onClick={onDelete} type="button">
          Delete {imagesCountText}
        </Button>
      </ContentSection.Footer>
    </ContentSection>
  );
};

// TODO: https://warthogs.atlassian.net/browse/MAASENG-2661
// refactor to use table.getSelectedRowModel(table.getState())
export const getSelectedIndividualImageRows = (rowSelection: RowSelectionState) => {
  // group rows have a non-numeric key (e.g. "name:CentOS")
  const isNotGroup = (key: string) => !isNaN(Number(key));
  return Object.keys(rowSelection).filter(isNotGroup);
};

const DeleteImagesContainer = () => {
  const { rowSelection, clearRowSelection } = useRowSelection("images");
  const imagesCount = getSelectedIndividualImageRows(rowSelection).length;
  const { setSidebar } = useAppLayoutContext();

  const deleteImagesMutation = useDeleteImagesMutation({
    onSuccess: () => {
      setSidebar(null);
      clearRowSelection();
    },
  });

  // close sidebar when there are no images selected
  useEffect(() => {
    if (!imagesCount) {
      setSidebar(null);
    }
  }, [imagesCount, setSidebar]);

  const handleDelete = () => {
    const selectedIds = Object.keys(rowSelection).map((id) => Number(id));
    deleteImagesMutation.mutate(selectedIds);
  };

  return (
    <DeleteImages
      count={imagesCount}
      error={deleteImagesMutation.error}
      onCancel={() => {
        setSidebar(null);
      }}
      onDelete={handleDelete}
    />
  );
};

export default DeleteImagesContainer;

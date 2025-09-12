import type { ReactElement } from "react";

import { ContentSection } from "@canonical/maas-react-components";
import { Button, Notification } from "@canonical/react-components";
import type { RowSelectionState } from "@tanstack/react-table";
import pluralize from "pluralize";

import { useRemoveImagesFromSelection } from "@/app/api/query/images";
import { useAppLayoutContext, useRowSelection } from "@/app/context";

// TODO: https://warthogs.atlassian.net/browse/MAASENG-2661
// refactor to use table.getSelectedRowModel(table.getState())
export const getSelectedIndividualImageRows = (rowSelection: RowSelectionState) => {
  // group rows have a non-numeric key (e.g. "name:CentOS")
  const isNotGroup = (key: string) => !isNaN(Number(key));
  return Object.keys(rowSelection).filter(isNotGroup);
};

export const RemoveAvailableImages = (): ReactElement => {
  const { rowSelection, clearRowSelection } = useRowSelection("images");
  const imagesCount = getSelectedIndividualImageRows(rowSelection).length;
  const { setSidebar } = useAppLayoutContext();

  const deleteImagesMutation = useRemoveImagesFromSelection();

  // close sidebar when there are no images selected
  useEffect(() => {
    if (!imagesCount) {
      setSidebar(null);
    }
  }, [imagesCount, setSidebar]);

  const imagesCountText = pluralize("available image", imagesCount || 0, true);

  return (
    <ContentSection>
      <ContentSection.Title>Remove {imagesCountText}</ContentSection.Title>
      <ContentSection.Content>
        {deleteImagesMutation.isError ? (
          <Notification severity="negative" title="Remove failed">
            {deleteImagesMutation.error.message}
          </Notification>
        ) : null}
        Are you sure you want to remove <strong>{imagesCountText}</strong> from the selection? This will also affect
        connected MAAS sites.
      </ContentSection.Content>
      <ContentSection.Footer>
        <Button
          appearance="base"
          onClick={() => {
            setSidebar(null);
            clearRowSelection();
          }}
          type="button"
        >
          Cancel
        </Button>
        <Button
          appearance="negative"
          onClick={() => {
            const selectedIds = Object.keys(rowSelection).map((id) => Number(id));
            deleteImagesMutation.mutate({ body: { selection_ids: selectedIds } });
            setSidebar(null);
            clearRowSelection();
          }}
          type="button"
        >
          Remove {imagesCountText}
        </Button>
      </ContentSection.Footer>
    </ContentSection>
  );
};

export default RemoveAvailableImages;

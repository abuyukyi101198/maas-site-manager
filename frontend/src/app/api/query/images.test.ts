import { setupServer } from "msw/node";

import {
  useAddImagesToSelection,
  useGetAlternativesForImage,
  useRemoveImagesFromSelection,
  useSelectableImages,
  useSelectedImages,
} from "@/app/api/query/images";
import type { RemoveSelectedImagesPostRequest, SelectImagesPostRequest } from "@/app/apiclient";
import {
  imageResolvers,
  mockAlternativeImages,
  mockSelectableImages,
  mockSelectedImages,
} from "@/testing/resolvers/images";
import { Providers, renderHook, waitFor } from "@/utils/test-utils";

const mockServer = setupServer(
  imageResolvers.selectedImages.handler(),
  imageResolvers.selectableImages.handler(),
  imageResolvers.getAlternativesForImage.handler(),
  imageResolvers.addImageToSelection.handler(),
  imageResolvers.removeImageFromSelection.handler(),
);

beforeAll(() => {
  mockServer.listen();
});
afterEach(() => {
  mockServer.resetHandlers();
});
afterAll(() => {
  mockServer.close();
});

describe("useSelectedImages", () => {
  it("should return selected images", async () => {
    const { result } = renderHook(() => useSelectedImages(), { wrapper: Providers });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data!.items).toEqual(mockSelectedImages);
  });
});

describe("useSelectable", () => {
  it("should return selectable images", async () => {
    const { result } = renderHook(() => useSelectableImages(), { wrapper: Providers });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data!.items).toEqual(mockSelectableImages);
  });
});

describe("useGetAlternativesForImage", () => {
  it("should return alternative images", async () => {
    const { result } = renderHook(
      () => useGetAlternativesForImage({ query: { os: "ubuntu", release: "noble", arch: "amd64" } }, true),
      { wrapper: Providers },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data!.items).toEqual(mockAlternativeImages);
  });
});

describe("useAddImagesToSelection", () => {
  it("should add images to selection", async () => {
    const newSelections: SelectImagesPostRequest = { selection_ids: [1, 2] };

    const { result } = renderHook(() => useAddImagesToSelection(), { wrapper: Providers });
    result.current.mutate({ body: newSelections });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe("useRemoveImagesFromSelection", () => {
  it("should remove images form selection", async () => {
    const removingSelections: RemoveSelectedImagesPostRequest = { selection_ids: [1, 2] };

    const { result } = renderHook(() => useRemoveImagesFromSelection(), { wrapper: Providers });
    result.current.mutate({ body: removingSelections });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

it.skip("should return an empty array", async () => {});

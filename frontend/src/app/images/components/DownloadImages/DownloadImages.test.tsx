import { http, HttpResponse } from "msw";

import DownloadImages from "./DownloadImages";

import type { UpstreamImage } from "@/app/api";
import { upstreamImageFactory } from "@/mocks/factories";
import { imagesResolvers } from "@/testing/resolvers/images";
import { apiUrls } from "@/utils/test-urls";
import { renderWithMemoryRouter, screen, setupServer, userEvent, waitFor } from "@/utils/test-utils";

const ubuntuImages = upstreamImageFactory.buildList(5, { os: "Ubuntu" });
const centOsImages = upstreamImageFactory.buildList(5, { os: "CentOS" });
const upstreamImages = [...ubuntuImages, ...centOsImages];

const mockServer = setupServer(
  imagesResolvers.listUpstreamImages.handler(upstreamImages),
  imagesResolvers.selectUpstreamImages.handler(),
);

beforeAll(() => {
  mockServer.listen();
});

afterEach(() => {
  mockServer.resetHandlers();
  localStorage.clear();
});

afterAll(() => {
  mockServer.close();
});

it("separates images by distro", async () => {
  renderWithMemoryRouter(<DownloadImages />);

  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /Ubuntu/i })).toBeInTheDocument();
  });

  expect(screen.getByRole("heading", { name: /CentOS/i })).toBeInTheDocument();
});

it("enables the submit button once the form has been edited", async () => {
  const images: UpstreamImage[] = [];
  const arches = ["amd64", "arm64", "i386"];

  arches.forEach((architecture) => {
    images.push(upstreamImageFactory.build({ os: "Ubuntu", release: "22.04 LTS", arch: architecture }));
  });

  const localHandlers = [
    imagesResolvers.listUpstreamImages.handler(images),
    imagesResolvers.selectUpstreamImages.handler(),
  ];

  mockServer.use(...localHandlers);

  renderWithMemoryRouter(<DownloadImages />);

  await waitFor(() => {
    expect(screen.getByRole("form", { name: /Select upstream images to sync/i })).toBeInTheDocument();
  });

  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

  await userEvent.click(screen.getByRole("tab", { name: "Ubuntu" }));

  await waitFor(() => {
    expect(screen.getByRole("combobox", { name: "Select architectures" })).toBeInTheDocument();
  });

  await userEvent.click(screen.getByRole("combobox", { name: "Select architectures" }));

  arches.forEach(async (arch) => {
    await userEvent.click(screen.getByRole("checkbox", { name: arch }));
  });

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });
});

it("displays errors that ocurred while fetching images", async () => {
  mockServer.use(
    http.get(apiUrls.upstreamImages, () => {
      return new HttpResponse(null, {
        status: 500,
        statusText: "error",
      });
    }),
  );

  renderWithMemoryRouter(<DownloadImages />);

  await waitFor(() => {
    expect(screen.getByText("Error while fetching upstream images")).toBeInTheDocument();
  });
});

it("displays errors that ocurred after submitting image selection", async () => {
  const images: UpstreamImage[] = [];
  const arches = ["amd64", "arm64", "i386"];

  arches.forEach((architecture) => {
    images.push(upstreamImageFactory.build({ os: "Ubuntu", release: "22.04 LTS", arch: architecture }));
  });

  mockServer.use(
    imagesResolvers.listUpstreamImages.handler(images),
    http.post(apiUrls.upstreamImages, () => {
      return HttpResponse.json(null, { status: 400, statusText: "error" });
    }),
  );

  renderWithMemoryRouter(<DownloadImages />);

  await waitFor(() => {
    expect(screen.getByRole("form", { name: /Select upstream images to sync/i })).toBeInTheDocument();
  });
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

  await userEvent.click(screen.getByRole("tab", { name: "Ubuntu" }));

  await waitFor(() => {
    expect(screen.getByRole("combobox", { name: "Select architectures" })).toBeInTheDocument();
  });

  await userEvent.click(screen.getByRole("combobox", { name: "Select architectures" }));

  await userEvent.click(screen.getByRole("checkbox", { name: "amd64" }));

  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => {
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
  });
});

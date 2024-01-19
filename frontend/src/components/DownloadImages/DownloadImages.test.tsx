import DownloadImages from "./DownloadImages";

import { upstreamImageFactory } from "@/mocks/factories";
import { createMockUpstreamImagesResolver } from "@/mocks/resolvers";
import { createMockGetServer } from "@/mocks/server";
import { apiUrls } from "@/utils/test-urls";
import { renderWithMemoryRouter, screen } from "@/utils/test-utils";

const upstreamImages = upstreamImageFactory.buildList(2);
const mockServer = createMockGetServer(apiUrls.upstreamImages, createMockUpstreamImagesResolver(upstreamImages));

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

it("renders without crashing", () => {
  renderWithMemoryRouter(<DownloadImages />);
  expect(screen.getByRole("heading", { name: "Download images" })).toBeInTheDocument();
});

it("displays buttons for image selection and upstream source", () => {
  renderWithMemoryRouter(<DownloadImages />);

  expect(screen.getByRole("button", { name: "Update upstream image source" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Select upstream images" })).toBeInTheDocument();
});

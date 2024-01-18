// src/mocks/browser.js
import { rest } from "msw";
import { setupServer } from "msw/node";

import { createMockSitesResolver } from "./resolvers";

import { apiUrls } from "@/utils/test-urls";

const createMockGetServer = (endpoint: string, resolver: ReturnType<typeof createMockSitesResolver>) =>
  setupServer(rest.get(endpoint, resolver));
const createMockPostServer = (endpoint: string, resolver: ReturnType<typeof createMockSitesResolver>) =>
  setupServer(rest.post(endpoint, resolver));
const createMockPatchServer = (endpoint: string, resolver: ReturnType<typeof createMockSitesResolver>) =>
  setupServer(rest.patch(endpoint, resolver));

const mockSitesServer = createMockGetServer(apiUrls.sites, createMockSitesResolver());
const mockPostTokensServer = createMockPostServer(apiUrls.tokens, createMockSitesResolver());

export { createMockGetServer, createMockPostServer, createMockPatchServer, mockSitesServer, mockPostTokensServer };

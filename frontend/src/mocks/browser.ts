import { setupWorker, rest } from "msw";

import { createMockSitesResolver } from "./resolvers";

import urls from "@/api/urls";

export const worker = setupWorker(rest.get(urls.sites, createMockSitesResolver()));

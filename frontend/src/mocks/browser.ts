import { setupWorker } from "msw";

import { getSites, getTokens, getEnrollmentRequests, patchEnrollmentRequests, postTokens } from "./resolvers";

export const worker = setupWorker(getSites, postTokens, getEnrollmentRequests, patchEnrollmentRequests, getTokens);

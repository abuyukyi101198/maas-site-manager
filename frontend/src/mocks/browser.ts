import { setupWorker } from "msw";

import { allResolvers } from "./resolvers";

export const worker = setupWorker(...allResolvers);

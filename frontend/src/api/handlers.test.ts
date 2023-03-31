import { setupServer } from "msw/node";

import { patchEnrollmentRequests, postTokens } from "./handlers";

import {
  postTokens as postTokensResolver,
  patchEnrollmentRequests as postEnrollmentRequestsResolver,
} from "@/mocks/resolvers";

const mockServer = setupServer(postTokensResolver, postEnrollmentRequestsResolver);

beforeAll(() => {
  mockServer.listen();
});
afterEach(() => {
  mockServer.resetHandlers();
});
afterAll(() => {
  mockServer.close();
});

describe("postTokens handler", () => {
  it("requires name, amount and expiration time", async () => {
    // @ts-expect-error
    await expect(postTokens({})).rejects.toThrowError();
    await expect(postTokens({ amount: 1, expires: "P0Y0M7DT0H0M0S" })).resolves.toEqual(
      expect.objectContaining({
        items: expect.any(Array),
      }),
    );
  });
});

describe("postEnrollmentRequests handler", () => {
  it("requires ids and accept values", async () => {
    // @ts-expect-error
    await expect(patchEnrollmentRequests({})).rejects.toThrowError();
    await expect(patchEnrollmentRequests({ ids: [], accept: false })).resolves.toEqual("");
    await expect(patchEnrollmentRequests({ ids: [], accept: true })).resolves.toEqual("");
  });
});

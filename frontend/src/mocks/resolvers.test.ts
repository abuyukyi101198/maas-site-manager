import { apiClient } from "@/api";
import { durationFactory } from "@/mocks/factories";
import { createMockTokensResolver } from "@/mocks/resolvers";
import { createMockPostServer } from "@/mocks/server";
import { apiUrls } from "@/utils/test-urls";

const mockServer = createMockPostServer(apiUrls.tokens, createMockTokensResolver());

beforeAll(() => {
  mockServer.listen();
});
afterEach(() => {
  mockServer.resetHandlers();
});
afterAll(() => {
  mockServer.close();
});

it("returns list of tokens", async () => {
  const count = 1;
  const result = await apiClient.default.postApiV1TokensPost({
    requestBody: { duration: durationFactory.build(), count },
  });
  expect(result.tokens).toHaveLength(count);
});

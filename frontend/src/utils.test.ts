import { customParamSerializer, parseSearchTextToQueryParams } from "./utils";

describe("parseSearchTextToQueryParams tests", () => {
  it('should modify search params from "label:value" to "label=value"', () => {
    const searchText = "country:cuba";
    const queryParams = parseSearchTextToQueryParams(searchText);
    expect(queryParams.includes(":")).toBe(false);
    expect(queryParams.includes("=")).toBe(true);
    expect(queryParams).toBe("country=cuba");
  });

  it("should modify multiple search params", () => {
    const searchText = "country:cuba city:paris";
    const queryParams = parseSearchTextToQueryParams(searchText);
    const expectedResponse = "country=cuba&city=paris";
    expect(queryParams).toBe(expectedResponse);
  });
});

describe("customParamSerializer", () => {
  it("should serialize params normally if just params are provided", () => {
    const params = { page: "1", size: "20" };
    const serialized = customParamSerializer(params);
    const expectedResult = "page=1&size=20";
    expect(serialized).toBe(expectedResult);
  });

  it("should be compatible with already serialized queryText", () => {
    const params = { page: "1", size: "20" };
    const serializedQueryText = "country=cuba";
    const serialized = customParamSerializer(params, serializedQueryText);
    const expectedResult = `page=1&size=20&${serializedQueryText}`;
    expect(serialized).toBe(expectedResult);
  });
});

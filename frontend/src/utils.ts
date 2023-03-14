import * as countries from "i18n-iso-countries";
import { getName } from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

if (typeof window !== "undefined") {
  countries.registerLocale(en);
}

export const getCountryName = (countryCode: string) => {
  return getName(countryCode, "en", { select: "official" });
};

export const parseSearchTextToQueryParams = (text: string) => {
  // if text:result => text=result
  if (!text) return "";
  const parsedText = text
    .split(" ")
    .map((item) => (item.includes(":") ? item.replaceAll(":", "=") : ""))
    .join("&");
  if (parsedText.at(-1) === "&") {
    return parsedText.substring(0, parsedText.length - 1);
  }
  return parsedText;
};

export const customParamSerializer = (params: Record<string, string>, queryText?: string) => {
  return (
    Object.entries(Object.assign({}, params))
      .map(([key, value]) => `${key}=${value}`)
      .join("&") + `${queryText ? "&" + queryText : ""}`
  );
};

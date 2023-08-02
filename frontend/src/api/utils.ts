import { baseURL } from "./config";

export const getApiUrl = (path: string) => {
  return new URL(path, baseURL).toString();
};

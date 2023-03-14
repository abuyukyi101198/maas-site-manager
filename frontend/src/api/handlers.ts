import api from "./api";
import urls from "./urls";

import { customParamSerializer } from "@/utils";

export type GetSitesQueryParams = {
  page: string;
  size: string;
};

export const getSites = async (params: GetSitesQueryParams, queryText?: string) => {
  try {
    const response = await api.get(urls.sites, {
      params,
      paramsSerializer: {
        serialize: (params) => customParamSerializer(params, queryText),
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

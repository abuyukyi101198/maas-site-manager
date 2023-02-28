import api from "./api";
import urls from "./urls";

export const getSites = async () => {
  try {
    const response = await api.get(urls.sites);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

import { getApiUrl } from "./utils";

const urls = {
  login: getApiUrl("/login"),
  logout: getApiUrl("/logout"),
  sites: getApiUrl("/sites"),
  sitesCoordinates: getApiUrl("/sites/coordinates"),
  tokens: getApiUrl("/tokens"),
  users: getApiUrl("/users"),
  enrollmentRequests: getApiUrl("/requests"),
  currentUser: getApiUrl("/users/me"),
};

export default urls;

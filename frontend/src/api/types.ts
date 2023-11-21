import type { PendingSitesGetResponse, SitesGetResponse, TokensGetResponse, UsersGetResponse } from "@/api-client";
import type { Site as SiteModel } from "@/api-client/models/Site";
import type { Prettify } from "@/types";

export type Site = SiteModel;
export type AccessToken = {
  access_token: string;
  token_type: "bearer";
};

export type PaginatedQueryResult = Prettify<
  PendingSitesGetResponse | SitesGetResponse | TokensGetResponse | UsersGetResponse
>;

export type SitesCoordinatesQueryResult = { items: Pick<Site, "id" | "coordinates">[] };

export type Token = {
  id: number;
  value: string;
  expired: string; //<ISO 8601 date string>,
  created: string; //<ISO 8601 date string>
};

export type EnrollmentRequest = {
  id: string;
  name: string;
  url: string;
  created: string; // <ISO 8601 date>,
};

export type User = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  is_admin: boolean;
};

import type { Site as SiteModel } from "@/api-client/models/Site";

export type Site = SiteModel;
export type AccessToken = {
  access_token: string;
  token_type: "bearer";
};

export type Stats = {
  allocated_machines: number;
  deployed_machines: number;
  ready_machines: number;
  error_machines: number;
  total_machines: number;
  last_seen: string; // <ISO 8601 date string>
};

export type PaginatedQueryResult<D extends unknown> = {
  items: D[];
  total: number;
  page: number;
  size: number;
};

export type SitesQueryResult = PaginatedQueryResult<Site>;
export type SitesCoordinatesQueryResult = { items: Pick<Site, "id" | "coordinates">[] };

export type Token = {
  id: number;
  value: string;
  expired: string; //<ISO 8601 date string>,
  created: string; //<ISO 8601 date string>
};
export type PostTokensResult = PaginatedQueryResult<Token>;

export type EnrollmentRequest = {
  id: string;
  name: string;
  url: string;
  created: string; // <ISO 8601 date>,
};

export type EnrollmentRequestsQueryResult = PaginatedQueryResult<EnrollmentRequest>;

export type User = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  is_admin: boolean;
};

export type UsersQueryResult = PaginatedQueryResult<User>;

import type { Site, User } from "../apiclient";

export type SortDirection = "asc" | "desc";

export type SitesSortKey = keyof Pick<Site, "name">;
export type UserSortKey = keyof Pick<User, "email" | "full_name" | "username">;

export type SortBy<T extends SitesSortKey | UserSortKey> = `${T}-${SortDirection}` | null;

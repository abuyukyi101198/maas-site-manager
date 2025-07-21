import { Icon } from "@canonical/react-components";
import type { Header } from "@tanstack/react-table";

import type { Image } from "@/app/api";
import type { Site, User } from "@/app/apiclient";

export const SortIndicator = ({
  header,
}: {
  header: Header<Image, Partial<Image>> | Header<Site, Partial<Site>> | Header<User, Partial<User>>;
}) =>
  ({
    asc: <Icon name="chevron-up">ascending</Icon>,
    desc: <Icon name="chevron-down">descending</Icon>,
  })[header?.column?.getIsSorted() as string] ?? null;

export default SortIndicator;

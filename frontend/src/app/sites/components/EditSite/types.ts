import type { Coordinates } from "@/app/apiclient";

export type CoordinatesFormValue = "" | `${Coordinates["latitude"]}, ${Coordinates["longitude"]}`;

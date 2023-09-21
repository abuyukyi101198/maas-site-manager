/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ConnectionStatus } from './ConnectionStatus';
import type { SiteData } from './SiteData';
import type { TimeZone } from './TimeZone';

/**
 * A MAAS installation.
 */
export type Site = {
    id: number;
    name: string;
    city: (string | null);
    country: (string | null);
    latitude: (string | null);
    longitude: (string | null);
    note: (string | null);
    state: (string | null);
    address: (string | null);
    postal_code: (string | null);
    timezone: (TimeZone | null);
    url: string;
    name_unique: boolean;
    connection_status: ConnectionStatus;
    stats: (SiteData | null);
};


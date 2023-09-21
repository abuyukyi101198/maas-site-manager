/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TimeZone } from './TimeZone';

/**
 * Update a site without setting it's name_unique.
 */
export type SiteUpdateRequest = {
    name: string;
    city?: (string | null);
    country?: (string | null);
    latitude?: (string | null);
    longitude?: (string | null);
    note?: (string | null);
    state?: (string | null);
    address?: (string | null);
    postal_code?: (string | null);
    timezone?: (TimeZone | null);
    url: string;
};


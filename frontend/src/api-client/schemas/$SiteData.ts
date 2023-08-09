/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SiteData = {
    description: `Data for a site.`,
    properties: {
        total_machines: {
            type: 'number',
            isRequired: true,
        },
        allocated_machines: {
            type: 'number',
            isRequired: true,
        },
        deployed_machines: {
            type: 'number',
            isRequired: true,
        },
        ready_machines: {
            type: 'number',
            isRequired: true,
        },
        error_machines: {
            type: 'number',
            isRequired: true,
        },
        other_machines: {
            type: 'number',
            isRequired: true,
        },
        last_seen: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
    },
} as const;

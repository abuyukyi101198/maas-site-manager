/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Site = {
    description: `A MAAS installation.`,
    properties: {
        id: {
            type: 'number',
            isRequired: true,
        },
        name: {
            type: 'string',
            isRequired: true,
        },
        name_unique: {
            type: 'boolean',
            isRequired: true,
        },
        city: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
        country: {
            type: 'any-of',
            contains: [{
                type: 'string',
                maxLength: 2,
                minLength: 2,
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
        latitude: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
        longitude: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
        note: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
        state: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
        address: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
        postal_code: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
        timezone: {
            type: 'any-of',
            contains: [{
                type: 'TimeZone',
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
        url: {
            type: 'string',
            isRequired: true,
        },
        connection_status: {
            type: 'ConnectionStatus',
            isRequired: true,
        },
        stats: {
            type: 'any-of',
            contains: [{
                type: 'SiteData',
            }, {
                type: 'null',
            }],
            isRequired: true,
        },
    },
} as const;

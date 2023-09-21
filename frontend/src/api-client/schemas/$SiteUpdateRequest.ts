/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SiteUpdateRequest = {
    description: `Update a site without setting it's name_unique.`,
    properties: {
        name: {
            type: 'string',
            isRequired: true,
        },
        city: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
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
        },
        latitude: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        longitude: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        note: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        state: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        address: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        postal_code: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        timezone: {
            type: 'any-of',
            contains: [{
                type: 'TimeZone',
            }, {
                type: 'null',
            }],
        },
        url: {
            type: 'string',
            isRequired: true,
        },
    },
} as const;

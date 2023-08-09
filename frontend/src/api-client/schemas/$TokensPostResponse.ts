/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TokensPostResponse = {
    description: `List of created tokens, along with their duration.`,
    properties: {
        expired: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        tokens: {
            type: 'array',
            contains: {
                type: 'string',
                format: 'uuid',
            },
            isRequired: true,
        },
    },
} as const;

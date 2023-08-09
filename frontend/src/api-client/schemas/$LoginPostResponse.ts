/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $LoginPostResponse = {
    description: `User login response with JSON Web Token.`,
    properties: {
        access_token: {
            type: 'string',
            isRequired: true,
        },
        token_type: {
            type: 'string',
            isRequired: true,
        },
    },
} as const;

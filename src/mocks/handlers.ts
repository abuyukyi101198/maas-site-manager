import { rest } from "msw";
// Matches any "GET /user" requests,
// and responds using the `responseResolver` function.
rest.get("/user", responseResolver);

import { createRoutesFromElements, Route, redirect } from "react-router-dom";

import MainLayout from "@/components/MainLayout";
import Login from "@/pages/login";
import Requests from "@/pages/requests";
import SitesList from "@/pages/sites";
import Tokens from "@/pages/tokens/tokens";

export const routesConfig = {
  sites: {
    path: "/sites",
    title: "Regions",
  },
  requests: {
    path: "/requests",
    title: "Requests",
  },
  tokens: {
    path: "/tokens",
    title: "Tokens",
  },
} as const;

type RoutesConfig = typeof routesConfig;
export type RoutePath = RoutesConfig[keyof RoutesConfig]["path"];

export const routes = createRoutesFromElements(
  <>
    <Route element={<Login />} path="/login" />
    <Route element={<MainLayout />} path="/">
      {/*
          TODO: redirect to /login when unauthenticated
          https://warthogs.atlassian.net/browse/MAASENG-1450
      */}
      <Route index loader={() => redirect("sites")} />
      <Route path="logout" />
      <Route element={<SitesList />} path="sites" />
      <Route element={<Requests />} path="requests" />
      <Route element={<Tokens />} path="tokens" />
      <Route path="users" />
    </Route>
    ,
  </>,
);

export default routes;

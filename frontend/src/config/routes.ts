type RouteConfig = {
  path: string;
  title: string;
  isRedirect?: boolean;
};

export const protectedRoutes: Record<string, RouteConfig> = {
  sites: {
    path: "/sites",
    title: "Sites",
    isRedirect: true,
  },
  sitesList: {
    path: "/sites/list",
    title: "Sites List",
  },
  sitesMap: {
    path: "/sites/map",
    title: "Sites Map",
  },
  settings: {
    path: "/settings",
    title: "Settings",
    isRedirect: true,
  },
  requests: {
    path: "/settings/requests",
    title: "Requests",
  },
  tokens: {
    path: "/settings/tokens",
    title: "Tokens",
  },
  users: {
    path: "/settings/users",
    title: "Users",
  },
  mapSettings: {
    path: "/settings/map",
    title: "Map",
  },
  settingsImages: {
    path: "/settings/images",
    title: "",
    isRedirect: true,
  },
  settingsImagesServer: {
    path: "/settings/images/server",
    title: "Image server",
  },
  settingsImagesMaas: {
    path: "/settings/images/maas",
    title: "maas.io",
  },
  settingsImagesTransfer: {
    path: "/settings/images/transfer",
    title: "Transfer images",
  },
  account: {
    path: "/account",
    title: "Account",
    isRedirect: true,
  },
  personalDetails: {
    path: "/account/details",
    title: "Personal Details",
  },
  images: {
    path: "/images",
    title: "",
    isRedirect: true,
  },
  imagesList: {
    path: "/images/list",
    title: "Images",
  },
  password: {
    path: "/account/password",
    title: "Password",
  },
  logout: {
    path: "/logout",
    title: "",
    isRedirect: true,
  },
} as const;

export const publicRoutes: Record<string, RouteConfig> = {
  index: { path: "/", title: "", isRedirect: true },
  login: {
    path: "/login",
    title: "Login",
  },
} as const;

export const routesConfig = { ...publicRoutes, ...protectedRoutes } as const;

// pages without redirect routes
export const protectedPages = Object.values(protectedRoutes).filter((route) => !route?.isRedirect);
export const publicPages = Object.values(publicRoutes).filter((route) => !route?.isRedirect);
export const pages = [...protectedPages, ...publicPages];

type RoutesConfig = typeof routesConfig;
export type RoutePath = RoutesConfig[keyof RoutesConfig]["path"];
export type RouteTitle = RoutesConfig[keyof RoutesConfig]["title"];

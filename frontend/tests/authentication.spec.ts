import { test, expect, Page } from "@playwright/test";
import { admin } from "./constants";
import { routesConfig } from "@/config/routes";

export const login = async ({ page }: { page: Page }) => {
  await page.getByRole("textbox", { name: "Email" }).type(admin.email);
  await page.getByRole("textbox", { name: "Password" }).type(admin.password);
  await page.getByRole("button", { name: "Login" }).click();
};

test(`user is redirected to login page when attempting to visit ${routesConfig.sitesList.path}`, async ({ page }) => {
  await page.goto(routesConfig.sitesList.path);
  await expect(page).toHaveURL(
    `${routesConfig.login.path}?redirectTo=${encodeURIComponent(routesConfig.sitesList.path)}`,
  );
});

test("user is redirected to enrolled sites list after login", async ({ page }) => {
  await page.goto(routesConfig.login.path);
  await login({ page });
  await expect(page).toHaveURL(routesConfig.sitesList.path);
});

test("user is redirected to the URL they wanted to visit", async ({ page }) => {
  await page.goto(routesConfig.requests.path);
  await login({ page });
  await expect(page).toHaveURL(routesConfig.requests.path);
});

test("maintains authentication state after page reload", async ({ page }) => {
  await page.goto(routesConfig.sitesList.path);
  await login({ page });
  await expect(page).toHaveURL(routesConfig.sitesList.path);
  await page.reload();
  await expect(page).toHaveURL(routesConfig.sitesList.path);
});

import { test, expect } from "@playwright/test";

import { adminAuthFile } from "./constants";
import { routesConfig } from "@/config/routes";

test.use({ storageState: adminAuthFile });

test.beforeEach(async ({ page }) => {
  await page.goto(routesConfig.sitesMap.path);
});

test("displays site markers", async ({ page }) => {
  const map = page.getByRole("region", { name: "regions map" });
  // displays markers
  await expect(map).toBeVisible({ timeout: 5000 });
  await expect(map.getByRole("button", { name: /region location marker/i }).first()).toBeVisible();
  // opens region edit on click of a marker
  const editRegion = page.getByRole("complementary", { name: /Region details/i });
  await expect(editRegion).not.toBeAttached();
  await page
    .getByRole("button", { name: /region location marker/i })
    .first()
    .press("Enter");
  await expect(editRegion).toBeVisible();
});

test("returns to previous side panel if it exists", async ({ page }) => {
  const map = page.getByRole("region", { name: "regions map" });
  await expect(map).toBeVisible({ timeout: 5000 });
  await page
    .getByRole("button", { name: /region location marker/i })
    .first()
    .press("Enter");
  await page
    .getByRole("complementary", { name: /Region details/i })
    .getByRole("button", { name: "Edit" })
    .click();

  await expect(page.getByRole("complementary", { name: /Edit region/i })).toBeVisible();

  await page.getByRole("button", { name: /Cancel/i }).click();

  await expect(page.getByRole("complementary", { name: /Region details/i })).toBeVisible();
});

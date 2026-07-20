import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: "reduce" }));

test("landing page has working primary paths and no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("quieter home");
  await expect(page.getByRole("button", { name: /get started|dashboard/i }).first()).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("demo profile and case study remain usable on narrow screens", async ({ page }) => {
  await page.goto("/lena");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#contact")).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(accessibility.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
  const project = page.locator("#work a").first();
  await expect(project).toBeVisible();
  await project.click();
  await expect(page.getByText("Case study", { exact: true })).toBeVisible();
});

test("legal and authentication routes are reachable", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacy policy" })).toBeVisible();
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: "Terms of use" })).toBeVisible();
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /sign in or get started/i })).toBeVisible();
});

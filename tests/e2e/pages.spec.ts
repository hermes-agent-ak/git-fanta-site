import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const basePath = "/git-fanta-site/";

test.describe("final page composition", () => {
  test("renders the homepage sequence and purposeful actions", async ({
    page,
  }) => {
    await page.goto(basePath);

    await expect(page.locator("main#main-content h1")).toHaveText("Git Fanta");
    await expect(page.locator("#product-showcase")).toBeVisible();
    await expect(page.locator("#features")).toBeVisible();
    await expect(page.locator("#workflow")).toBeVisible();
    await expect(page.locator("#download")).toBeVisible();
    await expect(page.locator("#open-source")).toBeVisible();
    await expect(page.locator(".showcase-frame figcaption")).toContainText(
      "Derived project showcase media",
    );
    await expect(
      page
        .locator(".hero-section__actions")
        .getByRole("link", { name: "Download Git Fanta" }),
    ).toHaveAttribute("href", `${basePath}download/`);
  });

  test("keeps the 404 route useful and animated-independent", async ({
    page,
  }) => {
    await page.goto(`${basePath}404.html`);

    await expect(page.locator("main#main-content h1")).toHaveText(
      "This route does not exist.",
    );
    await expect(
      page.getByRole("link", { name: "Return home" }),
    ).toHaveAttribute("href", basePath);
    await expect(
      page.getByRole("link", { name: "Browse downloads" }),
    ).toHaveAttribute("href", `${basePath}download/`);
  });

  test("passes Axe on the public routes @a11y", async ({ page }) => {
    for (const route of [
      basePath,
      `${basePath}download/`,
      `${basePath}404.html`,
    ]) {
      await page.goto(route);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(
        accessibilityScanResults.violations,
        `Axe violations on ${route}`,
      ).toEqual([]);
    }
  });
});

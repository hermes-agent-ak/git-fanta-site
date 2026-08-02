import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("bootstrap page", () => {
  test("renders the accessible static shell @a11y", async ({ page }) => {
    await page.goto("/git-fanta-site/");

    await expect(page).toHaveTitle("Git Fanta");
    await expect(page.locator("main#main-content h1")).toHaveText("Git Fanta");
    await expect(page.locator("a.skip-link")).toHaveAttribute(
      "href",
      "#main-content",
    );
    await expect(page.locator("main#main-content")).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

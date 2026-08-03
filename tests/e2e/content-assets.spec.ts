import { expect, test } from "@playwright/test";

const basePath = "/git-fanta-site/";

test.describe("content and asset foundation", () => {
  test("renders the verified logo through the base-path-safe shell", async ({
    page,
  }) => {
    await page.goto(basePath);

    const brandLink = page.getByRole("link", { name: "Git Fanta home" });
    const logo = brandLink.locator("img.brand-logo");

    await expect(brandLink).toHaveAttribute("href", basePath);
    await expect(logo).toHaveCount(1);
    await expect(logo).toHaveAttribute("alt", "");
    await expect(logo).toHaveAttribute("src", /\/git-fanta-logo\.svg$/);

    await expect
      .poll(() =>
        logo.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  });
});

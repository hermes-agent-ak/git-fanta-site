import { expect, test } from "@playwright/test";

const basePath = "/git-fanta-site/";

test.describe("download experience", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${basePath}download/`);
  });

  test("renders the release summary, warnings, and known assets", async ({
    page,
  }) => {
    await expect(page.locator("main#main-content h1")).toHaveText(
      "Download Git Fanta",
    );
    await expect(page.locator("#release-summary-heading")).toContainText(
      "Git Fanta v1.0.2",
    );
    await expect(page.locator("main#main-content")).toContainText(
      "SHA256SUMS available",
    );
    await expect(page.locator("main#main-content")).toContainText(
      "may be unsigned",
    );
    await expect(page.locator("main#main-content")).toContainText(
      "installs alongside git-cola",
    );
    await expect(
      page.getByRole("link", { name: /Windows x86_64 Installer/ }),
    ).toHaveCount(2);
    await expect(
      page.getByRole("link", { name: /View release notes on GitHub/ }),
    ).toHaveAttribute(
      "href",
      "https://github.com/hermes-agent-ak/git-fanta/releases/tag/v1.0.2",
    );
  });

  test("supports manual selection without automatic download", async ({
    page,
  }) => {
    await page.locator("[data-download-selector]").scrollIntoViewIfNeeded();
    await expect(page.locator("astro-island:not([ssr])")).toHaveCount(1);
    const radios = page.getByRole("radio");
    await expect(radios).toHaveCount(7);
    await expect(radios.first()).toBeChecked();

    await radios.nth(2).check();
    await expect(page.locator('[aria-live="polite"]')).toContainText(
      "Linux x86_64 Portable archive",
    );
    await expect(page.locator(".download-selector__action")).toHaveAttribute(
      "href",
      "https://github.com/hermes-agent-ak/git-fanta/releases/download/v1.0.2/git-fanta-v1.0.2-linux-x86_64.tar.gz",
    );
    await expect(page).toHaveURL(`${basePath}download/`);
  });

  test("keeps direct links when JavaScript is disabled", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${basePath}download/`);

    await expect(
      page.getByRole("heading", { name: "Direct release links" }),
    ).toBeVisible();
    await expect(
      page
        .locator("[data-download-fallback]")
        .getByRole("link", { name: /Download Windows x86_64 Installer/ }),
    ).toBeVisible();
    await expect(
      page.getByText("Windows and macOS builds may be unsigned."),
    ).toBeVisible();
    await context.close();
  });
});

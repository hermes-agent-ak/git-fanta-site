import { expect, test } from "@playwright/test";

const basePath = "/git-fanta-site/";

test.describe("metadata and static discovery", () => {
  test("emits canonical, social, favicon, and conservative JSON-LD metadata", async ({
    page,
  }) => {
    await page.goto(basePath);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://hermes-agent-ak.github.io/git-fanta-site/",
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/git-fanta-site\/social\/git-fanta-social-preview\.svg$/,
    );
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      "href",
      `${basePath}favicon.svg`,
    );

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(jsonLd).toBeTruthy();
    const structuredData = JSON.parse(jsonLd!);
    expect(structuredData["@type"]).toBe("SoftwareApplication");
    expect(structuredData).not.toHaveProperty("aggregateRating");
    expect(structuredData).not.toHaveProperty("offers");
    expect(structuredData).not.toHaveProperty("operatingSystem");
  });

  test("publishes a base-path-safe robots file and sitemap", async ({
    request,
  }) => {
    const robots = await request.get(`${basePath}robots.txt`);
    expect(robots.ok()).toBe(true);
    const robotsText = await robots.text();
    expect(robotsText).toContain("User-agent: *");
    expect(robotsText).toContain(
      "Sitemap: https://hermes-agent-ak.github.io/git-fanta-site/sitemap-index.xml",
    );

    const sitemap = await request.get(`${basePath}sitemap-index.xml`);
    expect(sitemap.ok()).toBe(true);
  });
});

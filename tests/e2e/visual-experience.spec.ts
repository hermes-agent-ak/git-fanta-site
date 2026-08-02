import { expect, test } from "@playwright/test";

const basePath = "/git-fanta-site/";

test.describe("Branchline visual experience", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(basePath);
  });

  test("provides normal anchor navigation with an active section", async ({
    page,
  }) => {
    const branchline = page.getByRole("navigation", { name: "Branchline" });
    const links = branchline.getByRole("link");

    await expect(branchline).toHaveCount(1);
    await expect(links).toHaveCount(5);
    await expect(links.nth(0)).toHaveAttribute("href", "#foundation");
    await expect(links.nth(0)).toHaveAttribute("aria-current", "location");
    await expect(links.nth(0)).toHaveAttribute("data-active", "true");
    await expect(links.nth(4)).toHaveAttribute("href", "#handoff");

    await links.nth(2).click();
    await expect(page).toHaveURL(`${basePath}#git-tree`);
    await expect(page.locator("#git-tree")).toBeVisible();
  });

  test("renders a decorative graph that does not carry semantic content", async ({
    page,
  }) => {
    const graph = page.locator('[data-visual="git-tree"]');

    await expect(graph).toHaveCount(1);
    await expect(graph).toHaveAttribute("aria-hidden", "true");
    await expect(graph.locator("[data-commit-marker]")).toHaveCount(5);
    await expect(graph.locator('[data-motion="branch-trace"]')).toHaveCount(1);
  });

  test("keeps the anchor list usable in the mobile presentation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });

    const branchline = page.getByRole("navigation", { name: "Branchline" });
    await expect(branchline.locator("summary")).toBeVisible();
    await expect(branchline.getByRole("link").first()).toBeVisible();

    const hasNoHorizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );
    expect(hasNoHorizontalOverflow).toBe(true);
  });

  test("keeps the visual route within the layout at review widths", async ({
    page,
  }) => {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(basePath);

      const hasNoHorizontalOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      );

      expect(hasNoHorizontalOverflow, `overflow at ${width}px`).toBe(true);
      await expect(page.locator('[data-visual="git-tree"]')).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Branchline" }),
      ).toBeVisible();
    }
  });

  test("keeps a complete static state when reduced motion is requested", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();

    const motionState = await page
      .locator('[data-motion="branch-trace"]')
      .evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          animationName: style.animationName,
          opacity: style.opacity,
        };
      });

    expect(motionState.animationName).toBe("none");
    expect(Number(motionState.opacity)).toBeGreaterThan(0);
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.locator("script")).toHaveCount(0);
  });
});

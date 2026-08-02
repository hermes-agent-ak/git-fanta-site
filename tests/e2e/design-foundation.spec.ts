import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const basePath = "/git-fanta-site/";

test.describe("design foundation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(basePath);
  });

  test("renders the semantic shell and base-path-safe navigation", async ({
    page,
  }) => {
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveAttribute("id", "main-content");
    await expect(page.getByRole("contentinfo")).toHaveCount(1);

    await expect(
      page.getByRole("link", { name: "Git Fanta home" }),
    ).toHaveAttribute("href", basePath);
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(
      1,
    );
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
        name: "Overview",
      }),
    ).toHaveAttribute("href", basePath);
    await expect(
      page.getByRole("contentinfo").getByRole("link", {
        name: "Repository",
      }),
    ).toHaveAttribute("href", "https://github.com/hermes-agent-ak/git-fanta");
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: "Releases" }),
    ).toHaveAttribute(
      "href",
      "https://github.com/hermes-agent-ak/git-fanta/releases",
    );
  });

  test("keeps the skip link first and exposes a visible focus ring", async ({
    page,
  }) => {
    const skipLink = page.locator("a.skip-link");

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    const linkButton = page.getByRole("link", { name: "Return to content" });
    await linkButton.focus();
    await expect(linkButton).toBeFocused();

    const focusStyle = await linkButton.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineColor: style.outlineColor,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });

    expect(focusStyle.outlineStyle).toBe("solid");
    expect(focusStyle.outlineWidth).toBe("3px");
    expect(focusStyle.outlineColor).not.toBe("rgb(0, 0, 0)");
  });

  test("keeps the static shell controls in keyboard order", async ({
    page,
  }) => {
    const expectedFocusOrder = [
      "Skip to content",
      "Git Fanta home",
      "Overview",
      "Repository",
      "Releases",
      "Issues",
      "License",
      "Foundation overview",
      "Branchline navigation",
      "Git tree visual grammar",
      "Progressive motion",
      "Phase handoff",
      "Return to content",
      "Repository",
      "Releases",
      "Issues",
      "License",
    ];

    for (const expectedName of expectedFocusOrder) {
      await page.keyboard.press("Tab");
      const focusedName = await page.evaluate(() => {
        const element = document.activeElement;
        return (
          element?.getAttribute("aria-label") || element?.textContent?.trim()
        );
      });

      expect(focusedName).toBe(expectedName);
    }
  });

  test("exposes semantic tokens and preserves native control behavior", async ({
    page,
  }) => {
    const tokenValues = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        pageBackground: styles
          .getPropertyValue("--gf-color-background-page")
          .trim(),
        accent: styles.getPropertyValue("--gf-color-accent-orange").trim(),
      };
    });

    expect(tokenValues.pageBackground).not.toBe("");
    expect(tokenValues.accent).not.toBe("");

    const linkButton = page.getByRole("link", { name: "Return to content" });
    await expect(linkButton).toHaveAttribute(
      "href",
      "/git-fanta-site/#main-content",
    );

    const nativeButton = page.getByRole("button", {
      name: "Preview action unavailable",
    });
    await expect(nativeButton).toHaveAttribute("type", "button");
    await expect(nativeButton).toBeDisabled();

    await expect(
      page.locator("article").filter({ hasText: "Link mode" }),
    ).toHaveCount(1);
  });

  test("disables smooth scrolling and non-essential transitions for reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();

    const motionStyles = await page.evaluate(() => {
      const htmlStyle = getComputedStyle(document.documentElement);
      const link = document.querySelector("a.brand-link");
      const linkStyle = link ? getComputedStyle(link) : undefined;

      return {
        scrollBehavior: htmlStyle.scrollBehavior,
        transitionDuration: linkStyle?.transitionDuration,
      };
    });

    expect(motionStyles.scrollBehavior).toBe("auto");
    expect(
      Number.parseFloat(motionStyles.transitionDuration ?? "1"),
    ).toBeLessThan(0.001);
  });

  test("passes Axe at the default viewport @a11y", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("passes Axe at a narrow mobile viewport @a11y", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(basePath);

    const hasNoHorizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );
    expect(hasNoHorizontalOverflow).toBe(true);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

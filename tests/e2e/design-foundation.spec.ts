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

  test("avoids repeating the primary links in the compact footer", async ({
    page,
  }) => {
    const footerNavigation = page.getByRole("navigation", {
      name: "Footer links",
    });

    await page.setViewportSize({ width: 320, height: 800 });
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(footerNavigation).toBeHidden();

    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(footerNavigation).toBeVisible();
    await expect(footerNavigation.getByRole("link")).toHaveCount(6);
  });

  test("uses the primary disclosure as the only sticky mobile navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(basePath);

    const toggle = page.getByRole("button", {
      name: "Open primary navigation",
    });
    const primary = page.getByRole("navigation", { name: "Primary" });

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(primary).toBeHidden();

    const initialLayout = await page.evaluate(() => {
      const headerElement = document.querySelector("header");
      const toggleElement = document.querySelector<HTMLElement>(
        "[data-site-nav-toggle]",
      );
      const branchlineElement = document.querySelector<HTMLElement>(
        "[data-branchline-nav]",
      );

      return {
        headerPosition: headerElement
          ? getComputedStyle(headerElement).position
          : null,
        headerHeight: headerElement?.getBoundingClientRect().height ?? 0,
        heroTop:
          document.querySelector("#hero")?.getBoundingClientRect().top ?? 0,
        branchlineDisplay: branchlineElement
          ? getComputedStyle(branchlineElement).display
          : null,
        toggleWidth: toggleElement?.getBoundingClientRect().width ?? 0,
        toggleHeight: toggleElement?.getBoundingClientRect().height ?? 0,
      };
    });

    expect(initialLayout).toMatchObject({
      headerPosition: "sticky",
      branchlineDisplay: "none",
      toggleWidth: 48,
      toggleHeight: 48,
    });
    expect(initialLayout.headerHeight).toBeGreaterThan(0);
    expect(initialLayout.heroTop).toBeGreaterThan(initialLayout.headerHeight);

    await toggle.click();
    await expect(
      page.getByRole("button", { name: "Close primary navigation" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(primary).toBeVisible();
    await expect(primary.getByRole("link")).toHaveCount(6);

    const openLayout = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      const panel = document.querySelector<HTMLElement>(
        "[data-site-nav-panel]",
      );
      const hero = document.querySelector<HTMLElement>("#hero");

      if (!header || !panel || !hero) {
        throw new Error("Expected mobile navigation geometry is missing");
      }

      const headerRect = header.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();

      return {
        panelPosition: getComputedStyle(panel).position,
        panelLeft: panelRect.left,
        panelRight: panelRect.right,
        panelTop: panelRect.top,
        panelBottom: panelRect.bottom,
        panelHeight: panelRect.height,
        headerBottom: headerRect.bottom,
        heroTop: heroRect.top,
        horizontalOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      };
    });

    expect(openLayout.panelPosition).toBe("static");
    expect(openLayout.panelLeft).toBeCloseTo(0, 0);
    expect(openLayout.panelRight).toBeCloseTo(320, 0);
    expect(openLayout.panelTop).toBeCloseTo(initialLayout.headerHeight - 1, 0);
    expect(openLayout.headerBottom).toBeCloseTo(openLayout.panelBottom + 1, 0);
    expect(openLayout.heroTop).toBeGreaterThanOrEqual(openLayout.panelBottom);
    expect(openLayout.heroTop - initialLayout.heroTop).toBeGreaterThanOrEqual(
      openLayout.panelHeight - 1,
    );
    expect(openLayout.horizontalOverflow).toBe(0);

    const linkHeights = await primary
      .getByRole("link")
      .evaluateAll((links) =>
        links.map((link) => link.getBoundingClientRect().height),
      );
    expect(linkHeights.every((height) => height >= 44)).toBe(true);

    await page.keyboard.press("Escape");
    await expect(primary).toBeHidden();
    await expect(toggle).toBeFocused();

    await page.evaluate(() =>
      window.scrollTo({ top: 700, behavior: "instant" }),
    );
    const scrolledBeforeOpen = await page.evaluate(() => ({
      scrollY: window.scrollY,
      mainTop: document.querySelector("main")?.getBoundingClientRect().top ?? 0,
    }));

    await toggle.click();
    const scrolledAfterOpen = await page.evaluate(() => {
      const panel = document.querySelector<HTMLElement>(
        "[data-site-nav-panel]",
      );

      return {
        scrollY: window.scrollY,
        mainTop:
          document.querySelector("main")?.getBoundingClientRect().top ?? 0,
        panelHeight: panel?.getBoundingClientRect().height ?? 0,
      };
    });

    expect(scrolledAfterOpen.scrollY).toBeCloseTo(
      scrolledBeforeOpen.scrollY,
      0,
    );
    expect(
      scrolledAfterOpen.mainTop - scrolledBeforeOpen.mainTop,
    ).toBeGreaterThanOrEqual(scrolledAfterOpen.panelHeight - 1);

    await page
      .getByRole("button", {
        name: "Close primary navigation",
      })
      .click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

    await page.setViewportSize({ width: 768, height: 900 });
    await toggle.click();

    const tabletLayout = await primary.evaluate((panel) => {
      const panelRect = panel.getBoundingClientRect();
      const groupTops = Array.from(
        panel.querySelectorAll<HTMLElement>(".site-header__nav-group"),
      ).map((group) => Math.round(group.getBoundingClientRect().top));

      return {
        panelLeft: panelRect.left,
        panelRight: panelRect.right,
        groupRows: new Set(groupTops).size,
        horizontalOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      };
    });

    expect(tabletLayout).toEqual({
      panelLeft: 0,
      panelRight: 768,
      groupRows: 1,
      horizontalOverflow: 0,
    });

    await page.setViewportSize({ width: 320, height: 320 });
    const landscapeLayout = await primary.evaluate((panel) => ({
      panelHeight: panel.getBoundingClientRect().height,
      clientHeight: panel.clientHeight,
      scrollHeight: panel.scrollHeight,
    }));

    expect(landscapeLayout.panelHeight).toBeLessThanOrEqual(248);
    expect(landscapeLayout.scrollHeight).toBeGreaterThan(
      landscapeLayout.clientHeight,
    );
    await expect(
      page.getByRole("button", { name: "Close primary navigation" }),
    ).toBeVisible();
  });

  test("keeps responsive navigation usable without JavaScript", async ({
    browser,
  }) => {
    for (const width of [320, 1024]) {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width, height: 800 },
      });
      const page = await context.newPage();

      try {
        await page.goto(basePath);

        const primary = page.getByRole("navigation", { name: "Primary" });
        const branchline = page.getByRole("navigation", {
          name: "On this page",
        });

        await expect(primary).toBeVisible();
        await expect(primary.getByRole("link")).toHaveCount(6);
        await expect(branchline.locator("details")).toHaveCount(0);
        await expect(page.locator("[data-site-nav-toggle]")).toBeHidden();

        if (width < 1024) {
          await expect(branchline).toBeHidden();

          const fallbackLayout = await page.evaluate(() => {
            const panel = document.querySelector<HTMLElement>(
              "[data-site-nav-panel]",
            );
            const hero = document.querySelector<HTMLElement>("#hero");

            if (!panel || !hero) {
              throw new Error("Expected no-JavaScript layout is missing");
            }

            const panelRect = panel.getBoundingClientRect();

            return {
              position: getComputedStyle(panel).position,
              left: panelRect.left,
              right: panelRect.right,
              panelBottom: panelRect.bottom,
              heroTop: hero.getBoundingClientRect().top,
              horizontalOverflow:
                document.documentElement.scrollWidth -
                document.documentElement.clientWidth,
            };
          });

          expect(fallbackLayout.position).toBe("static");
          expect(fallbackLayout.left).toBeCloseTo(0, 0);
          expect(fallbackLayout.right).toBeCloseTo(width, 0);
          expect(fallbackLayout.panelBottom).toBeLessThanOrEqual(
            fallbackLayout.heroTop,
          );
          expect(fallbackLayout.horizontalOverflow).toBe(0);
        } else {
          await expect(branchline).toBeVisible();
          await expect(branchline.getByRole("link")).toHaveCount(6);
        }
      } finally {
        await context.close();
      }
    }
  });

  test("keeps the skip link first and exposes visible focus rings", async ({
    page,
  }) => {
    const skipLink = page.locator("a.skip-link");

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    const linkButton = page
      .getByRole("link", { name: "Download Git Fanta" })
      .first();
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

  test("keeps the static shell controls keyboard reachable", async ({
    page,
  }) => {
    const controls = [
      page.locator("a.skip-link"),
      page.getByRole("link", { name: "Git Fanta home" }),
      page.getByRole("link", { name: "Download", exact: true }).first(),
      page.getByRole("link", { name: "Download Git Fanta" }).first(),
      page.getByRole("link", { name: "Product introduction" }),
      page.getByRole("link", { name: "Repository" }).first(),
    ];

    for (const control of controls) {
      await control.focus();
      await expect(control).toBeFocused();
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

    await expect(
      page.getByRole("link", { name: "Download Git Fanta" }).first(),
    ).toBeVisible();
    await expect(page.locator("#features")).toBeVisible();
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

    const closedScanResults = await new AxeBuilder({ page }).analyze();

    expect(closedScanResults.violations).toEqual([]);

    await page.getByRole("button", { name: "Open primary navigation" }).click();
    const openScanResults = await new AxeBuilder({ page }).analyze();

    expect(openScanResults.violations).toEqual([]);
  });

  test("preserves navigation boundaries in forced colors", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto(basePath);
    await page.getByRole("button", { name: "Open primary navigation" }).click();

    const navigationStyles = await page.evaluate(() => {
      const primary = document.querySelector<HTMLElement>(
        "[data-site-nav-panel]",
      );
      const branchline = document.querySelector<HTMLElement>(
        ".branchline-nav__surface",
      );
      const currentRoute = document.querySelector<HTMLElement>(
        '.branchline-nav__link[data-active="true"]',
      );

      return [primary, branchline, currentRoute].map((element) => {
        const style = getComputedStyle(element!);
        return {
          borderStyle: style.borderStyle,
          borderWidth: style.borderWidth,
        };
      });
    });

    expect(navigationStyles).toEqual([
      { borderStyle: "solid", borderWidth: "1px" },
      { borderStyle: "solid", borderWidth: "1px" },
      { borderStyle: "solid", borderWidth: "1px" },
    ]);
  });
});

import { expect, test } from "@playwright/test";

const basePath = "/git-fanta-site/";

test.describe("Branchline visual experience", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(basePath);
  });

  test("provides normal anchor navigation with an active section", async ({
    page,
  }) => {
    const branchline = page.getByRole("navigation", { name: "On this page" });
    const links = branchline.getByRole("link");

    await expect(branchline).toHaveCount(1);
    await expect(links).toHaveCount(6);
    await expect(links.nth(0)).toHaveAttribute("href", "#hero");
    await expect(links.nth(0)).toHaveAttribute("aria-current", "location");
    await expect(links.nth(0)).toHaveAttribute("data-active", "true");
    await expect(links.nth(5)).toHaveAttribute("href", "#open-source");
    await expect(branchline.locator('[data-active="true"]')).toHaveCount(1);
    await expect(branchline.locator('[aria-current="location"]')).toHaveCount(
      1,
    );

    for (let index = 1; index < (await links.count()); index += 1) {
      const link = links.nth(index);
      const href = await link.getAttribute("href");

      await link.click();
      await expect(page).toHaveURL(`${basePath}${href}`);
      await expect(branchline.locator('[data-active="true"]')).toHaveCount(1);
      await expect(branchline.locator('[aria-current="location"]')).toHaveCount(
        1,
      );
      await expect(link).toHaveAttribute("data-active", "true");
      await expect(link).toHaveAttribute("aria-current", "location");
    }

    await expect(page.locator('[data-visual="git-tree"]')).toBeVisible();
  });

  test("renders a decorative graph that does not carry semantic content", async ({
    page,
  }) => {
    const graph = page.locator('[data-visual="git-tree"]');

    await expect(graph).toHaveCount(1);
    await expect(graph).toHaveAttribute("aria-hidden", "true");
    await expect(graph.locator("[data-commit-marker]")).toHaveCount(6);
    await expect(graph.locator('[data-motion="branch-trace"]')).toHaveCount(1);
  });

  test("uses smooth paths for the workflow branch and merge", async ({
    page,
  }) => {
    const graph = page.locator(".workflow-preview__graph");
    await expect(graph.locator(".workflow-preview__paths")).toHaveAttribute(
      "viewBox",
      "0 0 240 240",
    );
    await expect(
      graph.locator(".workflow-preview__path--main"),
    ).toHaveAttribute("d", /C/);
    await expect(
      graph.locator(".workflow-preview__path--branch"),
    ).toHaveAttribute("d", /^M168 72 C.*C/);
    await expect(
      graph.locator('[class*="workflow-preview__node--branch-"]'),
    ).toHaveCount(2);
    await expect(
      graph.locator(".workflow-preview__node--branch-one"),
    ).toBeVisible();
    await expect(
      graph.locator(".workflow-preview__node--branch-two"),
    ).toBeVisible();
    await expect(graph.locator(".workflow-preview__node")).toHaveCount(7);
    await expect(graph.locator(".workflow-preview__node--merge")).toBeVisible();
  });

  test("omits the secondary route surface on compact layouts", async ({
    page,
  }) => {
    for (const width of [320, 768]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(basePath);

      const branchline = page.getByRole("navigation", { name: "On this page" });

      await expect(branchline).toBeHidden();
      await expect(branchline.locator("details")).toHaveCount(0);

      const hasNoHorizontalOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      );
      expect(hasNoHorizontalOverflow, `overflow at ${width}px`).toBe(true);
    }
  });

  test("forms an opaque desktop sticky stack without adding a mobile route bar", async ({
    page,
  }) => {
    for (const width of [1024, 1440, 320, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(basePath);
      await page.evaluate(() => window.scrollTo(0, 900));

      const layout = await page.evaluate(() => {
        const header = document.querySelector<HTMLElement>("header")!;
        const branchline = document.querySelector<HTMLElement>(
          "[data-branchline-nav]",
        )!;
        const surface = branchline.querySelector<HTMLElement>(
          ".branchline-nav__surface",
        )!;
        const headerBox = header.getBoundingClientRect();
        const branchlineBox = branchline.getBoundingClientRect();
        const surfaceBox = surface.getBoundingClientRect();
        const bridgeStyle = getComputedStyle(branchline, "::before");

        return {
          headerPosition: getComputedStyle(header).position,
          branchlineDisplay: getComputedStyle(branchline).display,
          branchlinePosition: getComputedStyle(branchline).position,
          headerBottom: headerBox.bottom,
          branchlineTop: branchlineBox.top,
          surfaceTop: surfaceBox.top,
          bridgeBackground: bridgeStyle.backgroundColor,
          bridgeShadow: bridgeStyle.boxShadow,
        };
      });

      expect(layout.headerPosition).toBe("sticky");

      if (width < 1024) {
        expect(layout.branchlineDisplay).toBe("none");
        continue;
      }

      expect(layout.branchlinePosition).toBe("sticky");
      expect(Math.abs(layout.branchlineTop - layout.headerBottom)).toBeLessThan(
        1,
      );
      expect(layout.surfaceTop).toBeGreaterThanOrEqual(layout.headerBottom + 8);
      expect(layout.bridgeBackground).not.toBe("rgba(0, 0, 0, 0)");
      expect(layout.bridgeShadow).not.toBe("none");
    }
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
      const branchline = page.getByRole("navigation", { name: "On this page" });
      if (width < 1024) {
        await expect(branchline).toBeHidden();
      } else {
        await expect(branchline).toBeVisible();
      }
    }
  });

  test("shows every route label and ref without truncation", async ({
    page,
  }) => {
    for (const width of [1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(basePath);

      const clippedContent = await page
        .getByRole("navigation", { name: "On this page" })
        .evaluate((navigation) =>
          Array.from(
            navigation.querySelectorAll<HTMLElement>(
              ".branchline-nav__label, code",
            ),
          )
            .filter((element) => element.scrollWidth > element.clientWidth + 1)
            .map((element) => element.textContent?.trim()),
        );

      expect(clippedContent, `clipped route content at ${width}px`).toEqual([]);
    }
  });

  test("keeps anchor targets below the active sticky navigation", async ({
    page,
  }) => {
    for (const width of [320, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(basePath);

      const link = page
        .getByRole("navigation", { name: "On this page" })
        .getByRole("link", { name: "Core features" });

      if (width < 1024) {
        await page.locator("#features").evaluate((element) => {
          element.scrollIntoView();
        });
      } else {
        await link.focus();
        await page.keyboard.press("Enter");
      }
      await page.waitForTimeout(1100);

      const geometry = await page.evaluate(() => {
        const header = document.querySelector("header")!;
        const branchline = document.querySelector<HTMLElement>(
          "[data-branchline-nav]",
        )!;
        const metadata = document.querySelector<HTMLElement>(
          "#features .section-heading-row",
        )!;
        const heading = document.querySelector<HTMLElement>("#features h2")!;
        const stickyElement =
          getComputedStyle(header).position === "sticky" ? header : branchline;

        return {
          stickyBottom: stickyElement.getBoundingClientRect().bottom,
          metadataTop: metadata.getBoundingClientRect().top,
          headingTop: heading.getBoundingClientRect().top,
        };
      });

      expect(
        geometry.metadataTop,
        `metadata placement at ${width}px`,
      ).toBeGreaterThanOrEqual(geometry.stickyBottom + 8);
      expect(
        geometry.headingTop,
        `heading placement at ${width}px`,
      ).toBeGreaterThan(geometry.stickyBottom);

      const activeControl = await page.evaluate(() => ({
        tagName: document.activeElement?.tagName ?? null,
        label: document.activeElement?.getAttribute("aria-label") ?? null,
      }));
      expect(activeControl, `focus destination at ${width}px`).not.toEqual({
        tagName: "BUTTON",
        label: "Open primary navigation",
      });
      if (activeControl.tagName === "A") {
        expect(activeControl.label).toBe("Core features");
      }
    }
  });

  test("centers the mobile graph and isolates the screenshot preview", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(basePath);
    await page
      .locator(".showcase-frame img")
      .evaluate((image) => (image as HTMLImageElement).decode());

    const layout = await page.evaluate(() => {
      const content = document.querySelector<HTMLElement>(
        ".branchline-content",
      );
      const graph = document.querySelector<HTMLElement>(
        ".workflow-preview__graph",
      );
      const mainNode = document.querySelector<HTMLElement>(
        ".workflow-preview__node--one",
      );
      const branchNode = document.querySelector<HTMLElement>(
        ".workflow-preview__node--branch-one",
      );
      const image = document.querySelector<HTMLElement>(".showcase-frame img");
      const imageViewport = document.querySelector<HTMLElement>(
        ".showcase-frame__viewport",
      );
      const tree = document.querySelector<HTMLElement>(".git-tree");

      if (
        !content ||
        !graph ||
        !mainNode ||
        !branchNode ||
        !image ||
        !imageViewport ||
        !tree
      ) {
        return null;
      }

      const contentBox = content.getBoundingClientRect();
      const graphBox = graph.getBoundingClientRect();
      const mainBox = mainNode.getBoundingClientRect();
      const branchBox = branchNode.getBoundingClientRect();
      const imageBox = image.getBoundingClientRect();
      const imageViewportBox = imageViewport.getBoundingClientRect();
      const treeBox = tree.getBoundingClientRect();
      const contentStyle = getComputedStyle(content);

      return {
        treeCenter: treeBox.x + treeBox.width / 2,
        treeRailCenter:
          contentBox.x + Number.parseFloat(contentStyle.paddingLeft) / 2,
        graphCenter: graphBox.x + graphBox.width / 2,
        graphVisualCenter:
          (mainBox.x + mainBox.width / 2 + branchBox.x + branchBox.width / 2) /
          2,
        screenshotRatio: imageViewportBox.width / imageViewportBox.height,
        croppedSourceLeft:
          (imageViewportBox.left - imageBox.left) / imageBox.width,
        croppedSourceTop:
          (imageViewportBox.top - imageBox.top) / imageBox.height,
        croppedSourceRight:
          (imageViewportBox.right - imageBox.left) / imageBox.width,
      };
    });

    expect(layout).not.toBeNull();
    expect(Math.abs(layout!.treeCenter - layout!.treeRailCenter)).toBeLessThan(
      1,
    );
    expect(
      Math.abs(layout!.graphVisualCenter - layout!.graphCenter),
    ).toBeLessThan(2);
    expect(layout!.screenshotRatio).toBeGreaterThan(1.3);
    expect(layout!.screenshotRatio).toBeLessThan(1.35);
    expect(layout!.croppedSourceLeft).toBeCloseTo(48 / 1536, 2);
    expect(layout!.croppedSourceTop).toBeCloseTo(88 / 1024, 2);
    expect(layout!.croppedSourceRight).toBeLessThan(0.75);
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
  });

  test("renders the fixture release version in the download section", async ({
    page,
  }) => {
    await expect(page.locator("#download")).toContainText("Git Fanta 1.0.2");
  });
});

import { describe, expect, it, vi } from "vitest";
import { initializeBranchlineEnhancement } from "../../src/components/visual/branchline-enhancement";

type TestLink = {
  hash: string;
  dataset: Record<string, string>;
  classList: { toggle: ReturnType<typeof vi.fn> };
  setAttribute: ReturnType<typeof vi.fn>;
  removeAttribute: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  triggerClick: () => void;
};

function createLink(id: string): TestLink {
  let clickHandler: (() => void) | undefined;
  const link: TestLink = {
    hash: `#${id}`,
    dataset: {},
    classList: { toggle: vi.fn() },
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    addEventListener: vi.fn((_event, handler: () => void) => {
      clickHandler = handler;
    }),
    triggerClick: () => clickHandler?.(),
  };

  return link;
}

function createRoot(ids: string[]) {
  const links = ids.map(createLink);
  const sections = ids.map((id) => ({ id }));
  const nav = {
    querySelectorAll: vi.fn(() => links),
    querySelector: vi.fn(() => null),
    addEventListener: vi.fn(),
  };
  const root = {
    querySelector: vi.fn(() => nav),
    getElementById: vi.fn((id: string) =>
      sections.find((section) => section.id === id),
    ),
  };

  return { links, root, sections };
}

describe("branchline enhancement", () => {
  it("synchronizes one active link after a click and an observed section", () => {
    const { links, root, sections } = createRoot(["foundation", "motion"]);
    let observerCallback: IntersectionObserverCallback | undefined;
    vi.useFakeTimers();

    class TestObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }

      observe = vi.fn();
    }

    try {
      initializeBranchlineEnhancement(
        root as never,
        {
          IntersectionObserver: TestObserver,
        } as never,
      );

      links[1]!.triggerClick();
      expect(links[0]!.dataset.active).toBe("false");
      expect(links[1]!.dataset.active).toBe("true");
      expect(links[1]!.setAttribute).toHaveBeenCalledWith(
        "aria-current",
        "location",
      );

      vi.advanceTimersByTime(1001);
      observerCallback?.(
        [
          {
            isIntersecting: true,
            intersectionRatio: 1,
            target: sections[0],
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );

      expect(links[0]!.dataset.active).toBe("true");
      expect(links[1]!.dataset.active).toBe("false");
      expect(links[1]!.removeAttribute).toHaveBeenCalledWith("aria-current");
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps click synchronization when IntersectionObserver is unavailable", () => {
    const { links, root } = createRoot(["foundation", "motion"]);

    initializeBranchlineEnhancement(
      root as never,
      {
        IntersectionObserver: undefined,
      } as never,
    );

    links[1]!.triggerClick();

    expect(links[1]!.dataset.active).toBe("true");
    expect(links[0]!.dataset.active).toBe("false");
  });

  it("does not move focus or control responsive disclosures after a click", () => {
    const { links, root } = createRoot(["foundation", "motion"]);
    const focus = vi.fn();
    const disclosure = { open: true };
    const nav = root.querySelector() as unknown as {
      querySelector: ReturnType<typeof vi.fn>;
    };

    nav.querySelector.mockImplementation((selector: string) => {
      if (selector === ".branchline-nav__disclosure") return disclosure;
      if (selector === "summary") return { focus };
      return null;
    });

    initializeBranchlineEnhancement(
      root as never,
      {
        IntersectionObserver: undefined,
        matchMedia: () => ({ matches: true }),
      } as never,
    );
    links[1]!.triggerClick();

    expect(disclosure.open).toBe(true);
    expect(focus).not.toHaveBeenCalled();
  });

  it("does nothing when the navigation root is absent", () => {
    const root = {
      querySelector: vi.fn(() => null),
      getElementById: vi.fn(),
    };

    initializeBranchlineEnhancement(root as never, {} as never);

    expect(root.querySelector).toHaveBeenCalledWith("[data-branchline-nav]");
  });
});

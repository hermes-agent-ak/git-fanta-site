import { describe, expect, it, vi } from "vitest";
import { initializeBranchlineEnhancement } from "../../src/components/visual/branchline-enhancement";

type TestLink = {
  hash: string;
  dataset: Record<string, string>;
  setAttribute: ReturnType<typeof vi.fn>;
  removeAttribute: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  triggerClick: () => void;
};

type TestSection = {
  id: string;
  top: number;
  getBoundingClientRect: () => { top: number };
};

function createLink(id: string): TestLink {
  let clickHandler: (() => void) | undefined;
  const link: TestLink = {
    hash: `#${id}`,
    dataset: {},
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
  const listeners = new Map<string, () => void>();
  const links = ids.map(createLink);
  const sections: TestSection[] = ids.map((id, index) => {
    const section = {
      id,
      top: 240 + index * 700,
      getBoundingClientRect: () => ({ top: section.top }),
    };

    return section;
  });
  const nav = {
    querySelectorAll: vi.fn(() => links),
    getBoundingClientRect: vi.fn(() => ({ bottom: 200 })),
  };
  const documentElement = {
    scrollTop: 0,
    clientHeight: 900,
    scrollHeight: 3000,
  };
  const root = {
    querySelector: vi.fn(() => nav),
    getElementById: vi.fn((id: string) =>
      sections.find((section) => section.id === id),
    ),
    addEventListener: vi.fn((event: string, handler: () => void) => {
      listeners.set(event, handler);
    }),
    documentElement,
  };
  const view = {
    requestAnimationFrame: vi.fn((callback: () => void) => {
      callback();
      return 1;
    }),
    addEventListener: vi.fn(),
  };

  return {
    documentElement,
    links,
    root,
    sections,
    trigger: (event: string) => listeners.get(event)?.(),
    view,
  };
}

describe("branchline enhancement", () => {
  it("advances monotonically when section tops cross the active line", () => {
    const { links, root, sections, trigger, view } = createRoot([
      "hero",
      "showcase",
      "features",
    ]);

    initializeBranchlineEnhancement(root as never, view as never);
    expect(links[0]!.dataset.active).toBe("true");

    sections[0]!.top = -480;
    sections[1]!.top = 220;
    trigger("scroll");
    expect(links[0]!.dataset.active).toBe("true");
    expect(links[1]!.dataset.active).toBe("false");

    sections[1]!.top = 208;
    trigger("scroll");
    expect(links[1]!.dataset.active).toBe("true");
    expect(links[0]!.dataset.active).toBe("false");

    sections[1]!.top = -492;
    sections[2]!.top = 208;
    trigger("scroll");
    expect(links[2]!.dataset.active).toBe("true");
    expect(links[1]!.dataset.active).toBe("false");
  });

  it("holds a clicked target until scrolling reaches it", () => {
    const { links, root, sections, trigger, view } = createRoot([
      "hero",
      "showcase",
    ]);

    initializeBranchlineEnhancement(root as never, view as never);
    links[1]!.triggerClick();
    expect(links[1]!.dataset.active).toBe("true");

    sections[0]!.top = -100;
    sections[1]!.top = 600;
    trigger("scroll");
    expect(links[1]!.dataset.active).toBe("true");

    sections[1]!.top = 208;
    trigger("scroll");
    expect(links[1]!.dataset.active).toBe("true");

    sections[0]!.top = 208;
    sections[1]!.top = 908;
    trigger("scroll");
    expect(links[0]!.dataset.active).toBe("true");
  });

  it("activates the final section at the document end", () => {
    const { documentElement, links, root, trigger, view } = createRoot([
      "hero",
      "showcase",
      "open-source",
    ]);

    initializeBranchlineEnhancement(root as never, view as never);
    documentElement.scrollTop = 2100;
    trigger("scroll");

    expect(links[2]!.dataset.active).toBe("true");
    expect(links[0]!.dataset.active).toBe("false");
  });

  it("releases click synchronization after interrupted scrolling", () => {
    const { links, root, sections, trigger, view } = createRoot([
      "hero",
      "showcase",
    ]);

    initializeBranchlineEnhancement(root as never, view as never);
    links[1]!.triggerClick();
    sections[0]!.top = 208;
    sections[1]!.top = 908;
    trigger("wheel");

    expect(links[0]!.dataset.active).toBe("true");
    expect(links[1]!.dataset.active).toBe("false");
  });

  it("keeps click synchronization when animation frames are unavailable", () => {
    const { links, root } = createRoot(["hero", "showcase"]);

    initializeBranchlineEnhancement(root as never, {});
    links[1]!.triggerClick();

    expect(links[1]!.dataset.active).toBe("true");
    expect(links[0]!.dataset.active).toBe("false");
  });

  it("does nothing when the navigation root is absent", () => {
    const root = {
      querySelector: vi.fn(() => null),
      getElementById: vi.fn(),
    };

    initializeBranchlineEnhancement(root as never, {});

    expect(root.querySelector).toHaveBeenCalledWith("[data-branchline-nav]");
  });
});

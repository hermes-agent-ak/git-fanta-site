import { describe, expect, it } from "vitest";

import { navigationItems, navigationHref } from "../../src/lib/navigation";

describe("navigation model", () => {
  it("resolves internal destinations through the configured base path", () => {
    const overview = navigationItems.find((item) => item.label === "Overview");

    expect(overview).toBeDefined();
    expect(overview?.external).toBe(false);
    expect(navigationHref(overview!, "/git-fanta-site/")).toBe(
      "/git-fanta-site/",
    );
  });

  it("leaves public external destinations unchanged", () => {
    const repository = navigationItems.find(
      (item) => item.label === "Repository",
    );

    expect(repository).toBeDefined();
    expect(repository?.external).toBe(true);
    expect(navigationHref(repository!, "/git-fanta-site/")).toBe(
      "https://github.com/hermes-agent-ak/git-fanta",
    );
  });

  it("does not expose a download destination before the download phase", () => {
    expect(navigationItems.some((item) => /download/i.test(item.label))).toBe(
      false,
    );
  });
});

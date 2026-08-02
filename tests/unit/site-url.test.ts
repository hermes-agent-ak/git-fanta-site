import { describe, expect, it } from "vitest";

import { siteHref } from "../../src/lib/site-url";

describe("siteHref", () => {
  it("keeps the home URL at the configured project base", () => {
    expect(siteHref("/", "/git-fanta-site/")).toBe("/git-fanta-site/");
  });

  it("does not duplicate slashes when joining a route to a base path", () => {
    expect(siteHref("/downloads", "/git-fanta-site")).toBe(
      "/git-fanta-site/downloads",
    );
  });

  it("preserves hash navigation under the project base", () => {
    expect(siteHref("/#main-content", "/git-fanta-site/")).toBe(
      "/git-fanta-site/#main-content",
    );
  });
});

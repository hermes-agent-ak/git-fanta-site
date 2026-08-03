import { describe, expect, it } from "vitest";
import {
  experienceSections,
  motionIntents,
  resolveExperienceSectionId,
} from "../../src/lib/experience-sections";

describe("experience section model", () => {
  it("defines unique real anchors for every visual section", () => {
    const ids = experienceSections.map((section) => section.id);
    const hrefs = experienceSections.map((section) => section.href);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);

    for (const section of experienceSections) {
      expect(section.href).toBe(`#${section.id}`);
      expect(section.id).toMatch(/^[a-z][a-z0-9-]+$/);
    }
  });

  it("keeps refs conceptual and free of live repository data", () => {
    for (const section of experienceSections) {
      expect(section.ref).toMatch(/^refs\/heads\/[a-z][a-z0-9/.-]+$/);
      expect(section.ref).not.toMatch(/[0-9a-f]{7,40}/i);
      expect(section.ref).not.toMatch(/(sha|commit|api|github)/i);
      expect(section.ariaLabel.length).toBeGreaterThan(8);
      expect(section.ariaLabel).not.toBe(section.ref);
    }
  });

  it("uses the documented visual node and tone vocabulary", () => {
    const nodes = new Set(["root", "commit", "branch", "merge"]);
    const tones = new Set(["orange", "green", "red", "neutral"]);

    for (const section of experienceSections) {
      expect(nodes.has(section.node)).toBe(true);
      expect(tones.has(section.tone)).toBe(true);
    }
  });

  it("falls back to the first section when an active id is invalid", () => {
    expect(resolveExperienceSectionId(experienceSections, "motion")).toBe(
      "motion",
    );
    expect(
      resolveExperienceSectionId(experienceSections, "not-a-section"),
    ).toBe("foundation");
  });

  it("declares bounded motion intents with reduced-motion fallbacks", () => {
    expect(motionIntents).toHaveLength(4);

    for (const intent of motionIntents) {
      expect(intent.properties.length).toBeGreaterThan(0);
      expect(intent.maxDurationMs).toBeGreaterThanOrEqual(160);
      expect(intent.maxDurationMs).toBeLessThanOrEqual(360);
      expect(["static", "fade"]).toContain(intent.reducedMotion);
    }
  });
});

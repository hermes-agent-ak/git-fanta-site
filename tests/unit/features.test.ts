import { describe, expect, it } from "vitest";

import {
  approvedFeatures,
  features,
  validateFeatureContent,
} from "../../src/content/features";

describe("source-backed feature content", () => {
  it("publishes only validated approved features", () => {
    expect(validateFeatureContent(features)).toEqual([]);
    expect(approvedFeatures).toHaveLength(features.length);

    for (const feature of approvedFeatures) {
      expect(feature.title.length).toBeGreaterThan(0);
      expect(feature.description.length).toBeGreaterThan(0);
      expect(feature.sourcePath).toMatch(/^(README\.md|docs\/)/);
    }
  });

  it("rejects claims without provenance or copy", () => {
    const issues = validateFeatureContent([
      {
        ...features[0],
        id: "",
        title: "",
        description: "",
        sourcePath: "",
        sourceSection: "",
        sourceRepository: "unknown/repository",
      },
    ]);

    expect(issues).toEqual([
      "feature-1: missing id",
      "feature-1: missing title",
      "feature-1: missing description",
      "feature-1: wrong source repository",
      "feature-1: missing source path",
      "feature-1: missing source section",
    ]);
  });
});

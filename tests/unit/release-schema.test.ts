import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import fixture from "../../src/lib/releases/fixtures/latest-release.json";
import { githubReleaseSchema } from "../../src/lib/releases/github-release-schema";

describe("GitHub release schema", () => {
  it("accepts the representative release response", () => {
    expect(githubReleaseSchema.parse(fixture)).toEqual(fixture);
  });

  it("accepts nullable release name, notes, and asset content type", () => {
    const nullablePayload = {
      ...fixture,
      name: null,
      body: null,
      assets: [{ ...fixture.assets[0], content_type: null }],
    };

    expect(githubReleaseSchema.parse(nullablePayload)).toMatchObject({
      name: null,
      body: null,
      assets: [{ content_type: null }],
    });
  });

  it("rejects invalid URLs and negative asset metadata with field paths", () => {
    const invalidPayload = {
      ...fixture,
      html_url: "http://example.com/release",
      assets: [{ ...fixture.assets[0], size: -1 }],
    };

    try {
      githubReleaseSchema.parse(invalidPayload);
      throw new Error("expected schema parsing to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect((error as ZodError).issues.map((issue) => issue.path)).toEqual([
        ["html_url"],
        ["assets", 0, "size"],
      ]);
    }
  });

  it("rejects a blank release tag and a non-ISO publication timestamp", () => {
    expect(() =>
      githubReleaseSchema.parse({ ...fixture, tag_name: "   " }),
    ).toThrow(ZodError);
    expect(() =>
      githubReleaseSchema.parse({ ...fixture, published_at: "yesterday" }),
    ).toThrow(ZodError);
  });
});

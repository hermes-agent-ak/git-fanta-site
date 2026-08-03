import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import fixture from "../../src/lib/releases/fixtures/latest-release.json";
import {
  loadLatestRelease,
  normalizeRelease,
} from "../../src/lib/releases/release-loader";

describe("release loader", () => {
  it("normalizes the checked-in fixture through the same schema boundary", async () => {
    const release = await loadLatestRelease({ mode: "fixture" });

    expect(release).toMatchObject({
      tagName: "v1.0.2",
      version: "1.0.2",
      title: "Git Fanta v1.0.2",
      releaseUrl:
        "https://github.com/hermes-agent-ak/git-fanta/releases/tag/v1.0.2",
    });
    expect(release.assets.map((asset) => asset.kind)).toEqual([
      "windows-installer",
      "linux-appimage",
      "linux-portable",
      "macos-zip",
      "python-wheel",
      "python-source",
      "checksums",
      "other",
    ]);
  });

  it("normalizes nullable fields and a tag without a leading v in live mode", async () => {
    const rawRelease = {
      ...fixture,
      tag_name: "release-2",
      name: "   ",
      body: null,
      assets: [{ ...fixture.assets[0], content_type: null }],
    };
    const fetchImpl = (async () =>
      new Response(JSON.stringify(rawRelease), {
        status: 200,
      })) as typeof fetch;

    const release = await loadLatestRelease({ mode: "live", fetchImpl });

    expect(release.version).toBe("release-2");
    expect(release.title).toBe("release-2");
    expect(release.notes).toBe("");
    expect(release.assets[0]?.contentType).toBe("application/octet-stream");
  });

  it("propagates schema failures and rejects unsupported modes", async () => {
    await expect(
      loadLatestRelease({
        mode: "fixture",
        fixtureData: { ...fixture, assets: "no" },
      }),
    ).rejects.toBeInstanceOf(ZodError);
    await expect(loadLatestRelease({ mode: "cache" })).rejects.toThrow(
      "Unsupported GITHUB_API_MODE: cache",
    );
  });

  it("does not fall back to fixture data after a live request fails", async () => {
    const fetchImpl = (async () => {
      throw new Error("offline");
    }) as typeof fetch;

    await expect(
      loadLatestRelease({ mode: "live", fetchImpl, fixtureData: fixture }),
    ).rejects.toThrow("GitHub release request failed: offline");
  });

  it("rejects a release tag that would produce an empty version", () => {
    expect(() => normalizeRelease({ ...fixture, tag_name: "v" })).toThrow(
      "GitHub release tag produced an empty version",
    );
  });
});

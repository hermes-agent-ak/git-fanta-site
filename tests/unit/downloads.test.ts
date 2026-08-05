import { describe, expect, it } from "vitest";

import fixture from "../../src/lib/releases/fixtures/latest-release.json";
import { loadLatestRelease } from "../../src/lib/releases/release-loader";
import { buildDownloadPageModel, formatBytes } from "../../src/lib/downloads";
import type { LatestRelease } from "../../src/lib/releases/types";

describe("download view model", () => {
  it("orders known assets and marks the platform recommendation", async () => {
    const release = await loadLatestRelease({
      mode: "fixture",
      fixtureData: fixture,
    });
    const model = buildDownloadPageModel(release);

    expect(model.version).toBe("1.0.2");
    expect(model.assets.map((asset) => asset.kind)).toEqual([
      "windows-installer",
      "linux-appimage",
      "linux-portable",
      "macos-zip",
      "python-wheel",
      "python-source",
      "checksums",
      "other",
    ]);
    expect(
      model.assets.find((asset) => asset.kind === "linux-appimage")
        ?.recommended,
    ).toBe(true);
    expect(model.checksum?.fileName).toBe("SHA256SUMS");
  });

  it("represents absent artifacts without guessing a URL", () => {
    const release: LatestRelease = {
      tagName: "v1.0.2",
      version: "1.0.2",
      title: "Git Fanta v1.0.2",
      publishedAt: "2026-07-31T12:00:00Z",
      releaseUrl:
        "https://github.com/hermes-agent-ak/git-fanta/releases/tag/v1.0.2",
      notes: "",
      assets: [],
    };
    const model = buildDownloadPageModel(release);
    const missingWindows = model.assets.find(
      (asset) => asset.kind === "windows-installer",
    );

    expect(missingWindows?.availability).toBe("missing");
    expect(missingWindows?.fileName).toBeNull();
    expect(missingWindows?.downloadUrl).toBeNull();
    expect(model.checksum?.availability).toBe("missing");
  });

  it("formats release sizes for readable direct links", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(52428800)).toBe("50 MB");
    expect(formatBytes(-1)).toBe("Size unavailable");
  });
});

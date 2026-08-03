import fixture from "./fixtures/latest-release.json";
import { githubReleaseSchema } from "./github-release-schema";
import {
  fetchLatestRelease,
  type ReleaseClientOptions,
} from "./release-client";
import { classifyReleaseAsset } from "./release-classifier";
import type { LatestRelease } from "./types";

export type GitHubApiMode = "live" | "fixture";

export interface ReleaseLoaderOptions extends ReleaseClientOptions {
  mode?: string;
  fixtureData?: unknown;
}

function normalizeRelease(raw: unknown): LatestRelease {
  const release = githubReleaseSchema.parse(raw);
  const version = release.tag_name.startsWith("v")
    ? release.tag_name.slice(1)
    : release.tag_name;

  if (!version.trim()) {
    throw new Error("GitHub release tag produced an empty version");
  }

  return {
    tagName: release.tag_name,
    version,
    title: release.name?.trim() || release.tag_name,
    publishedAt: release.published_at,
    releaseUrl: release.html_url,
    notes: release.body ?? "",
    assets: release.assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      kind: classifyReleaseAsset(asset.name),
      downloadUrl: asset.browser_download_url,
      size: asset.size,
      downloadCount: asset.download_count,
      contentType: asset.content_type ?? "application/octet-stream",
    })),
  };
}

export async function loadLatestRelease({
  mode = process.env.GITHUB_API_MODE ?? "live",
  fixtureData = fixture,
  ...clientOptions
}: ReleaseLoaderOptions = {}): Promise<LatestRelease> {
  let raw: unknown;

  if (mode === "fixture") {
    raw = fixtureData;
  } else if (mode === "live") {
    raw = await fetchLatestRelease(clientOptions);
  } else {
    throw new Error(`Unsupported GITHUB_API_MODE: ${mode}`);
  }

  return normalizeRelease(raw);
}

export { normalizeRelease };

import type {
  LatestRelease,
  ReleaseAsset,
  ReleaseAssetKind,
} from "./releases/types";

export type DownloadPlatform =
  "windows" | "linux" | "macos" | "python" | "other";

export type DownloadAvailability = "available" | "missing" | "unsupported";

export type DownloadAssetView = Readonly<{
  id: number | null;
  kind: ReleaseAssetKind;
  platform: DownloadPlatform;
  platformLabel: string;
  artifactLabel: string;
  fileName: string | null;
  sizeBytes: number;
  sizeLabel: string;
  downloadUrl: string | null;
  availability: DownloadAvailability;
  recommended: boolean;
}>;

export type DownloadPageModel = Readonly<{
  version: string;
  title: string;
  publishedAt: string;
  releaseUrl: string;
  completeReleaseUrl: string;
  checksum: DownloadAssetView | null;
  assets: readonly DownloadAssetView[];
}>;

type KnownAssetKind = Exclude<ReleaseAssetKind, "other">;

const KNOWN_ASSET_ORDER: readonly KnownAssetKind[] = [
  "windows-installer",
  "linux-appimage",
  "linux-portable",
  "macos-zip",
  "python-wheel",
  "python-source",
  "checksums",
];

const ASSET_LABELS: Record<
  Exclude<ReleaseAssetKind, "other">,
  Omit<
    DownloadAssetView,
    | "id"
    | "fileName"
    | "sizeBytes"
    | "sizeLabel"
    | "downloadUrl"
    | "availability"
    | "recommended"
  >
> = {
  "windows-installer": {
    kind: "windows-installer",
    platform: "windows",
    platformLabel: "Windows x86_64",
    artifactLabel: "Installer",
  },
  "linux-appimage": {
    kind: "linux-appimage",
    platform: "linux",
    platformLabel: "Linux x86_64",
    artifactLabel: "AppImage",
  },
  "linux-portable": {
    kind: "linux-portable",
    platform: "linux",
    platformLabel: "Linux x86_64",
    artifactLabel: "Portable archive",
  },
  "macos-zip": {
    kind: "macos-zip",
    platform: "macos",
    platformLabel: "macOS",
    artifactLabel: "ZIP archive",
  },
  "python-wheel": {
    kind: "python-wheel",
    platform: "python",
    platformLabel: "Python",
    artifactLabel: "Wheel",
  },
  "python-source": {
    kind: "python-source",
    platform: "python",
    platformLabel: "Python",
    artifactLabel: "Source archive",
  },
  checksums: {
    kind: "checksums",
    platform: "other",
    platformLabel: "All platforms",
    artifactLabel: "SHA256 checksums",
  },
};

const RECOMMENDED_KINDS = new Set<ReleaseAssetKind>([
  "windows-installer",
  "linux-appimage",
  "macos-zip",
  "python-wheel",
]);

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = -1;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function availableAssetView(
  asset: ReleaseAsset,
  recommended: boolean,
): DownloadAssetView {
  const labels = ASSET_LABELS[asset.kind as Exclude<ReleaseAssetKind, "other">];

  if (!labels) {
    return {
      id: asset.id,
      kind: "other",
      platform: "other",
      platformLabel: "Other release asset",
      artifactLabel: "Unclassified asset",
      fileName: asset.name,
      sizeBytes: asset.size,
      sizeLabel: formatBytes(asset.size),
      downloadUrl: asset.downloadUrl,
      availability: "unsupported",
      recommended: false,
    };
  }

  return {
    ...labels,
    id: asset.id,
    fileName: asset.name,
    sizeBytes: asset.size,
    sizeLabel: formatBytes(asset.size),
    downloadUrl: asset.downloadUrl,
    availability: "available",
    recommended,
  };
}

function missingAssetView(kind: KnownAssetKind): DownloadAssetView {
  const labels = ASSET_LABELS[kind];

  return {
    ...labels,
    id: null,
    fileName: null,
    sizeBytes: 0,
    sizeLabel: "Not published in this release",
    downloadUrl: null,
    availability: "missing",
    recommended: false,
  };
}

export function buildDownloadPageModel(
  release: LatestRelease,
): DownloadPageModel {
  const assets = KNOWN_ASSET_ORDER.flatMap((kind) => {
    const matchingAssets = release.assets.filter(
      (asset) => asset.kind === kind,
    );

    if (matchingAssets.length === 0) {
      return [missingAssetView(kind)];
    }

    return matchingAssets.map((asset, index) =>
      availableAssetView(
        asset,
        index === 0 && RECOMMENDED_KINDS.has(asset.kind),
      ),
    );
  });

  const unsupportedAssets = release.assets
    .filter((asset) => asset.kind === "other")
    .map((asset) => availableAssetView(asset, false));

  const allAssets = [...assets, ...unsupportedAssets];
  const checksum =
    allAssets.find((asset) => asset.kind === "checksums") ?? null;

  return {
    version: release.version,
    title: release.title,
    publishedAt: release.publishedAt,
    releaseUrl: release.releaseUrl,
    completeReleaseUrl: release.releaseUrl,
    checksum,
    assets: allAssets,
  };
}

export function getAvailableDownloadAssets(
  model: DownloadPageModel,
): readonly DownloadAssetView[] {
  return model.assets.filter((asset) => asset.availability === "available");
}

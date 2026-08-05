export const WEBSITE_SOURCE_REPOSITORY = "hermes-agent-ak/git-fanta-site";

export type AssetKind = "logo" | "screenshot";
export type AssetStatus = "ready" | "pending";

export type AssetRecord = Readonly<{
  id: string;
  kind: AssetKind;
  sourceRepository: string;
  sourcePath: string | null;
  targetPath: string | null;
  status: AssetStatus;
  altText: string;
  license: string;
  attribution: string;
  sourceUrl: string | null;
  derivedFrom: readonly string[];
  transformation: string | null;
}>;

export const assetManifest = [
  {
    id: "brand-logo",
    kind: "logo",
    sourceRepository: WEBSITE_SOURCE_REPOSITORY,
    sourcePath: "media/git-fanta-logo.png",
    targetPath: "public/brand/git-fanta-logo.svg",
    status: "ready",
    altText: "",
    license: "Project-owner permission for website publication",
    attribution:
      "Supplied directly by the project owner as the Git Fanta logo and vectorized from that supplied source.",
    sourceUrl:
      "https://cf-vectorizer-live.s3.amazonaws.com/cf-vectorizer-live/28973575/3HNjqm4RvT0T9xcwVClHw5AvT2T.svg",
    derivedFrom: ["media/git-fanta-logo.png"],
    transformation:
      "Vectorized SVG supplied by the project owner; the source PNG was not modified and the SVG was inspected for scripts and external references before publication.",
  },
  {
    id: "product-screenshot",
    kind: "screenshot",
    sourceRepository: WEBSITE_SOURCE_REPOSITORY,
    sourcePath: "media/screenshot.webp",
    targetPath: null,
    status: "pending",
    altText: "Pending review: supplied Git Fanta screenshot candidate.",
    license: "Pending provenance and publication review",
    attribution: "Supplied by the project owner; evidence review is pending.",
    sourceUrl: null,
    derivedFrom: [],
    transformation: null,
  },
  {
    id: "product-showcase",
    kind: "screenshot",
    sourceRepository: WEBSITE_SOURCE_REPOSITORY,
    sourcePath: "media/screenshot.webp",
    targetPath: "public/product/git-fanta-showcase.webp",
    status: "ready",
    altText:
      "Git Fanta interface showing commit history, branches, commit details, changed files, and repository status panels.",
    license:
      "Project-owner permission for this derived website showcase; underlying source provenance remains recorded separately.",
    attribution:
      "Composite prepared from media/screenshot.webp and media/git-fanta-logo.png at the project owner's request.",
    sourceUrl: null,
    derivedFrom: ["media/screenshot.webp", "media/git-fanta-logo.png"],
    transformation:
      "AI-assisted compositing framed the supplied screenshot and placed the supplied logo in reserved space; the machine-specific title-bar path was redacted before WebP conversion, and the original inputs were not modified.",
  },
] as const satisfies readonly AssetRecord[];

function isSafeRelativePath(path: string): boolean {
  return (
    path.length > 0 && !path.startsWith("/") && !path.split("/").includes("..")
  );
}

function isWithinDirectory(path: string, directory: string): boolean {
  return isSafeRelativePath(path) && path.startsWith(`${directory}/`);
}

function hasExplicitText(value: unknown): value is string {
  return typeof value === "string";
}

/** Validate asset provenance, publication state, and safe static destinations. */
export function validateAssetManifest(
  manifest: readonly AssetRecord[],
): string[] {
  return manifest.flatMap((asset) => validateAsset(asset));
}

function validateAsset(asset: AssetRecord): string[] {
  const label = asset.id || "unnamed";

  return [
    ...validateAssetIdentity(asset, label),
    ...validateAssetDerivation(asset, label),
    ...validateAssetDescription(asset, label),
    ...validateAssetPublication(asset, label),
  ];
}

function validateAssetIdentity(asset: AssetRecord, label: string): string[] {
  const issues: string[] = [];

  if (!asset.id.trim()) {
    issues.push("asset missing id");
  }
  if (!asset.sourceRepository.trim()) {
    issues.push(`asset "${label}": missing source repository`);
  }
  if (!asset.sourcePath || !isSafeRelativePath(asset.sourcePath)) {
    issues.push(`asset "${label}": missing or unsafe source path`);
  }

  return issues;
}

function validateAssetDerivation(asset: AssetRecord, label: string): string[] {
  const issues: string[] = [];

  if (asset.derivedFrom.some((sourcePath) => !isSafeRelativePath(sourcePath))) {
    issues.push(`asset "${label}": unsafe derived input path`);
  }
  if (asset.derivedFrom.length > 0 && !asset.transformation?.trim()) {
    issues.push(`asset "${label}": derived asset missing transformation note`);
  }

  return issues;
}

function validateAssetDescription(asset: AssetRecord, label: string): string[] {
  if (hasExplicitText(asset.altText)) {
    return [];
  }

  return [`asset "${label}": missing alternative-text decision`];
}

function validateAssetPublication(asset: AssetRecord, label: string): string[] {
  if (asset.status === "pending") {
    return asset.targetPath === null
      ? []
      : [`asset "${label}": pending asset must not have target path`];
  }
  if (asset.status !== "ready") {
    return [];
  }

  return [
    ...validateReadyAssetMetadata(asset, label),
    ...validateReadyAssetTarget(asset, label),
  ];
}

function validateReadyAssetMetadata(
  asset: AssetRecord,
  label: string,
): string[] {
  const issues: string[] = [];

  if (!asset.targetPath || !isSafeRelativePath(asset.targetPath)) {
    issues.push(
      `asset "${label}": ready asset has missing or unsafe target path`,
    );
  }
  if (!asset.license.trim()) {
    issues.push(`asset "${label}": ready asset missing licence`);
  }
  if (!asset.attribution.trim()) {
    issues.push(`asset "${label}": ready asset missing attribution`);
  }

  return issues;
}

function validateReadyAssetTarget(asset: AssetRecord, label: string): string[] {
  if (asset.targetPath === null) {
    return [];
  }
  if (
    asset.kind === "logo" &&
    !isWithinDirectory(asset.targetPath, "public/brand")
  ) {
    return [`asset "${label}": logo target must remain under public/brand`];
  }
  if (
    asset.kind === "screenshot" &&
    !isWithinDirectory(asset.targetPath, "public/product")
  ) {
    return [
      `asset "${label}": screenshot target must remain under public/product`,
    ];
  }

  return [];
}

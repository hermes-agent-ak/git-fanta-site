export type ReleaseAssetKind =
  | "windows-installer"
  | "linux-appimage"
  | "linux-portable"
  | "macos-zip"
  | "python-wheel"
  | "python-source"
  | "checksums"
  | "other";

export interface ReleaseAsset {
  id: number;
  name: string;
  kind: ReleaseAssetKind;
  downloadUrl: string;
  size: number;
  downloadCount: number;
  contentType: string;
}

export interface LatestRelease {
  tagName: string;
  version: string;
  title: string;
  publishedAt: string;
  releaseUrl: string;
  notes: string;
  assets: ReleaseAsset[];
}

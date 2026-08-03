import type { ReleaseAssetKind } from "./types";

/** Classify a release asset from its complete, case-sensitive filename. */
export function classifyReleaseAsset(filename: string): ReleaseAssetKind {
  const name = filename.trim();

  if (/^git-fanta-v.+-windows-x86_64-installer\.exe$/.test(name)) {
    return "windows-installer";
  }

  if (/^git-fanta-v.+-linux-x86_64\.AppImage$/.test(name)) {
    return "linux-appimage";
  }

  if (/^git-fanta-v.+-linux-x86_64\.tar\.gz$/.test(name)) {
    return "linux-portable";
  }

  if (/^git-fanta-v.+-macos\.zip$/.test(name)) {
    return "macos-zip";
  }

  if (/^git_fanta-.+\.whl$/.test(name)) {
    return "python-wheel";
  }

  if (name === "SHA256SUMS") {
    return "checksums";
  }

  if (/^git_fanta-.+\.tar\.gz$/.test(name)) {
    return "python-source";
  }

  return "other";
}

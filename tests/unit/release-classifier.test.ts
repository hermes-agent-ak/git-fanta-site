import { describe, expect, it } from "vitest";
import { classifyReleaseAsset } from "../../src/lib/releases/release-classifier";

describe("release asset classifier", () => {
  it.each([
    ["git-fanta-v1.0.2-windows-x86_64-installer.exe", "windows-installer"],
    ["git-fanta-v1.0.2-linux-x86_64.AppImage", "linux-appimage"],
    ["git-fanta-v1.0.2-linux-x86_64.tar.gz", "linux-portable"],
    ["git-fanta-v1.0.2-macos.zip", "macos-zip"],
    ["git_fanta-1.0.2-py3-none-any.whl", "python-wheel"],
    ["SHA256SUMS", "checksums"],
    ["git_fanta-1.0.2.tar.gz", "python-source"],
  ] as const)("classifies %s as %s", (filename, expected) => {
    expect(classifyReleaseAsset(filename)).toBe(expected);
  });

  it("trims surrounding whitespace without changing case-sensitive rules", () => {
    expect(
      classifyReleaseAsset("  git-fanta-v1.0.2-linux-x86_64.AppImage  "),
    ).toBe("linux-appimage");
    expect(classifyReleaseAsset("git-fanta-v1.0.2-linux-x86_64.appimage")).toBe(
      "other",
    );
  });

  it("does not guess unknown archives or operating systems", () => {
    expect(classifyReleaseAsset("git-fanta-v1.0.2-source.tar.gz")).toBe(
      "other",
    );
    expect(classifyReleaseAsset("release-notes.txt")).toBe("other");
  });
});

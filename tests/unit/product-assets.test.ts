import { describe, expect, it } from "vitest";
import {
  assetManifest,
  validateAssetManifest,
  type AssetRecord,
} from "../../src/content/assets";

const readyLogo = assetManifest.find((asset) => asset.id === "brand-logo")!;
const pendingScreenshot = assetManifest.find(
  (asset) => asset.id === "product-screenshot",
)!;

describe("product asset manifest", () => {
  it("accepts the ready logo and pending candidate records", () => {
    expect(validateAssetManifest(assetManifest)).toEqual([]);
    expect(readyLogo.status).toBe("ready");
    expect(readyLogo.sourcePath).toBe("media/git-fanta-logo.png");
    expect(readyLogo.targetPath).toBe("public/brand/git-fanta-logo.svg");
    expect(readyLogo.sourceUrl).toMatch(
      /cf-vectorizer-live\.s3\.amazonaws\.com/,
    );
    expect(readyLogo.derivedFrom).toEqual(["media/git-fanta-logo.png"]);
    expect(pendingScreenshot.status).toBe("pending");
  });

  it("keeps the screenshot candidate pending without a destination", () => {
    expect(pendingScreenshot.sourcePath).toBe("media/screenshot.webp");
    expect(pendingScreenshot.targetPath).toBeNull();
    expect(pendingScreenshot.altText).toMatch(/pending/i);
  });

  it("records the requested derived showcase and both source inputs", () => {
    const showcase = assetManifest.find(
      (asset) => asset.id === "product-showcase",
    )!;

    expect(showcase.status).toBe("ready");
    expect(showcase.targetPath).toBe("public/product/git-fanta-showcase.webp");
    expect(showcase.derivedFrom).toEqual([
      "media/screenshot.webp",
      "media/git-fanta-logo.png",
    ]);
    expect(showcase.transformation).toMatch(/composit/i);
  });

  it("rejects a ready asset without attribution", () => {
    const candidate: AssetRecord = { ...readyLogo, attribution: "" };

    expect(validateAssetManifest([candidate])).toContain(
      'asset "brand-logo": ready asset missing attribution',
    );
  });

  it("rejects a ready logo whose target escapes public/brand", () => {
    const candidate: AssetRecord = {
      ...readyLogo,
      targetPath: "public/assets/git-fanta-logo.png",
    };

    expect(validateAssetManifest([candidate])).toContain(
      'asset "brand-logo": logo target must remain under public/brand',
    );
  });

  it("rejects a ready screenshot whose target escapes public/product", () => {
    const candidate: AssetRecord = {
      ...pendingScreenshot,
      status: "ready",
      targetPath: "public/brand/screenshot.webp",
      license: "Example licence",
      attribution: "Example attribution",
    };

    expect(validateAssetManifest([candidate])).toContain(
      'asset "product-screenshot": screenshot target must remain under public/product',
    );
  });

  it("rejects a pending screenshot with a destination", () => {
    const candidate: AssetRecord = {
      ...pendingScreenshot,
      targetPath: "public/product/screenshot.webp",
    };

    expect(validateAssetManifest([candidate])).toContain(
      'asset "product-screenshot": pending asset must not have target path',
    );
  });

  it("rejects a derived asset without a transformation note", () => {
    const showcase = assetManifest.find(
      (asset) => asset.id === "product-showcase",
    )!;
    const candidate: AssetRecord = { ...showcase, transformation: null };

    expect(validateAssetManifest([candidate])).toContain(
      'asset "product-showcase": derived asset missing transformation note',
    );
  });
});

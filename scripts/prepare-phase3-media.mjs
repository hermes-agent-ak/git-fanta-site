import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error(
    "Usage: node scripts/prepare-phase3-media.mjs <input-png> <output-webp>",
  );
}

const input = await readFile(inputPath);
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.setContent(
    `<img id="source" alt="" src="data:image/png;base64,${input.toString("base64")}">`,
  );
  await page.locator("#source").evaluate(async (element) => {
    await element.decode();
  });

  const encoded = await page.locator("#source").evaluate((element) => {
    const image = element;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas 2D context is unavailable");
    }

    context.drawImage(image, 0, 0);

    // The supplied screenshot contains a machine-specific absolute path in
    // the embedded window title. Keep the title bar shape, but redact that
    // path before static publication.
    context.fillStyle = "#eeeeee";
    context.fillRect(280, 88, 560, 30);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error("WebP encoding failed"));
            return;
          }

          const bytes = new Uint8Array(await blob.arrayBuffer());
          let binary = "";
          bytes.forEach((byte) => {
            binary += String.fromCharCode(byte);
          });
          resolve(btoa(binary));
        },
        "image/webp",
        0.86,
      );
    });
  });

  await writeFile(outputPath, Buffer.from(encoded, "base64"));
} finally {
  await browser.close();
}

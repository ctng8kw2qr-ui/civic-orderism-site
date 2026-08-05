#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HTML_PATH = path.join(
  ROOT,
  "quartz",
  "static",
  "files",
  "civic-orderism-organization-manual.html",
);
const PDF_PATH = path.join(
  ROOT,
  "quartz",
  "static",
  "files",
  "civic-orderism-organization-manual.pdf",
);
const NODE_MODULES =
  process.env.NODE_PATH ||
  "/Users/zhaopengbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const BROWSERS_PATH =
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
  path.join(ROOT, "work", "playwright-browsers");

function resolveChromiumPath() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_PATH,
    path.join(
      BROWSERS_PATH,
      "chromium-1223",
      "chrome-mac-arm64",
      "Google Chrome for Testing.app",
      "Contents",
      "MacOS",
      "Google Chrome for Testing",
    ),
    path.join(
      process.env.HOME || "",
      "Library",
      "Caches",
      "ms-playwright",
      "chromium_headless_shell-1223",
      "chrome-headless-shell-mac-arm64",
      "chrome-headless-shell",
    ),
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function main() {
  if (!fs.existsSync(HTML_PATH)) {
    throw new Error("未找到《组织手册》HTML 源文件。");
  }

  const playwright = require(path.join(NODE_MODULES, "playwright"));
  const chromiumPath = resolveChromiumPath();
  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: chromiumPath,
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1800 },
    deviceScaleFactor: 1,
  });

  await page.goto(`file://${HTML_PATH}`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: PDF_PATH,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    preferCSSPageSize: true,
    margin: { top: "10mm", bottom: "12mm", left: "0", right: "0" },
    headerTemplate: `
      <div style="width:100%;padding:0 18mm;font-family:Arial,sans-serif;font-size:7px;color:#6b7582;display:flex;justify-content:space-between;letter-spacing:.08em;">
        <span>公民秩序主义组织手册</span><span>Civic Orderism</span>
      </div>`,
    footerTemplate: `
      <div style="width:100%;padding:0 18mm;font-family:Arial,sans-serif;font-size:7px;color:#6b7582;display:flex;justify-content:space-between;letter-spacing:.05em;">
        <span>Civic Orderism · civicorderism.com</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
  });
  await browser.close();

  console.log(`PDF: ${PDF_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

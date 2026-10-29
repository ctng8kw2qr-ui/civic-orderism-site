import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

// Uses existing local browser tooling; no new project dependency.
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.QA_PLAYWRIGHT ||
    "/Users/zhaopengbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const serve = require("serve-handler");
const folder = process.env.QA_OUTPUT || "/private/tmp/xi-world-review";
fs.mkdirSync(folder, { recursive: true });
const server = http.createServer((req, res) =>
  serve(req, res, { public: path.resolve("public"), cleanUrls: true }),
);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  for (const [name, width, height, colorScheme] of [
    ["desktop-light", 1440, 1000, "light"],
    ["desktop-dark", 1440, 1000, "dark"],
    ["mobile-light", 390, 844, "light"],
    ["mobile-dark", 390, 844, "dark"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      colorScheme,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(`${base}/china/the-world-xi-jinping-sees`, {
      waitUntil: "networkidle",
    });
    // Exercise existing theme tokens explicitly; this is preview-only state.
    await page.evaluate(
      (theme) => document.documentElement.setAttribute("saved-theme", theme),
      colorScheme,
    );
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      h1: document.querySelector("h1")?.textContent,
      headingCount: document.querySelectorAll(".article-content h2").length,
      cover: [...document.images]
        .filter((x) => x.src.includes("editorial-xi-filtered-reality"))
        .map((x) => ({
          loaded: x.complete && x.naturalWidth > 0,
          width: x.naturalWidth,
          height: x.naturalHeight,
        })),
      theme: document.documentElement.getAttribute("saved-theme"),
    }));
    await page.screenshot({ path: `${folder}/${name}-top.png` });
    await page.locator(".article-content h2").nth(6).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${folder}/${name}-body.png` });
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.screenshot({ path: `${folder}/${name}-bottom.png` });
    console.log(JSON.stringify({ name, ...info, errors }));
    if (
      info.overflow ||
      errors.length ||
      !info.cover.length ||
      !info.cover.every((x) => x.loaded)
    )
      throw new Error(`${name} failed`);
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

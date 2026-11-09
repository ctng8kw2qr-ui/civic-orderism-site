#!/usr/bin/env node
/**
 * Phase 2 post-build metadata.
 *
 * GitHub Pages does not execute `_redirects`; the 3 folder-index duplicates and
 * the 2 PDF-source HTML files therefore stay reachable. They must not compete
 * with the canonical pages in search. Injecting `noindex,follow` after the
 * Quartz build is the GitHub-Pages-compatible treatment and does not touch the
 * PDF generation pipeline or any article URL.
 */
import fs from "node:fs";
import path from "node:path";

const publicDir = path.resolve("public");
const files = [
  "about/index.html",
  "articles/index.html",
  "preparation/index.html",
  "files/civic-orderism-introduction-manual-source.html",
  "static/files/civic-orderism-introduction-manual-source.html",
];

const marker = '<meta name="robots" content="noindex,follow">';
let changed = 0;

for (const relative of files) {
  const file = path.join(publicDir, relative);
  if (!fs.existsSync(file)) {
    console.warn(`postbuild-phase2: missing expected file: ${relative}`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if (html.includes(marker)) continue;
  if (!html.includes("</head>")) {
    console.warn(`postbuild-phase2: no </head> in ${relative}`);
    continue;
  }
  const output = html.replace("</head>", `${marker}</head>`);
  fs.writeFileSync(file, output, "utf8");
  changed += 1;
  console.log(`postbuild-phase2: noindex -> ${relative}`);
}

console.log(`postbuild-phase2: ${changed} file(s) updated`);

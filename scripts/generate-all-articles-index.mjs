#!/usr/bin/env node
/**
 * Generate /articles/all from the single current classification source.
 *
 * This page used to be hand-maintained and drifted to 104 articles. It is now
 * generated from data/phase2-content-map.json so the directory can never
 * silently omit a new editorial article. Category/landing pages remain
 * editorial surfaces and are not generated here.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const map = JSON.parse(
  fs.readFileSync(path.join(root, "data/phase2-content-map.json"), "utf8"),
).articles;
const sections = [
  ["政治路线", "01", "POLITICAL ROUTE"],
  ["政治经济观察", "02", "POLITICAL & ECONOMIC OBSERVATION"],
  ["理论与制度", "03", "THEORY & INSTITUTIONS"],
];

const escape = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const compare = (a, b) =>
  String(b.date).localeCompare(String(a.date)) ||
  String(a.title).localeCompare(String(b.title), "zh-CN") ||
  a.slug.localeCompare(b.slug);

const rows = (items) =>
  items
    .slice()
    .sort(compare)
    .map(
      (item) => `<a class="inst4l-row" href="${escape(item.url)}">
  <span class="inst4l-row__cell"><span class="inst4l-row__meta">${escape(item.date)} · ${escape(item.category)}</span><span class="inst4l-row__title">${escape(item.title)}</span></span>
  <span class="inst4l-row__desc">${escape(item.summary)}</span>
  <span class="inst4l-row__arrow" aria-hidden="true">→</span>
</a>`,
    )
    .join("\n");

const sectionHtml = sections
  .map(([name, num, en]) => {
    const items = map.filter((item) => item.primary_section === name);
    return `<section class="inst4l-section" id="${num}">
<div class="inst4l-section__head">
<p class="inst4-eyebrow">${num} ${en}</p>
<h2 class="inst4l-section__title">${name}</h2>
<p class="inst4l-section__desc">${items.length} 篇研究 · 按真实发布日期排序</p>
</div>
<div class="inst4l-list">
${rows(items)}
</div>
</section>`;
  })
  .join("\n");

const page = `---
title: "全部文章"
date: 2026-11-09
updated: 2026-11-09
description: "按三个一级主栏目浏览公民秩序主义全部已发布研究。"
contentType: "文章索引"
status: published
listed: true
folderListed: true
noindex: false
---

<div class="inst4 inst4l inst4l-archive">
  <section class="inst4l-hero">
<p class="inst4-eyebrow">RESEARCH ARCHIVE</p>
<h1 class="inst4l-title">全部研究</h1>
<p class="inst4l-lead">按三个一级主栏目浏览全部已发布研究。需要按问题搜索时，可以使用页面上方的搜索入口。</p>
<p class="inst4l-status">${map.length} 篇研究 · 3 个一级主栏目</p>
  </section>

${sectionHtml}
</div>
`;

fs.writeFileSync(path.join(root, "content/articles/all.md"), page, "utf8");
console.log(
  `Generated /articles/all: ${map.length} articles; ${sections.map(([name]) => `${name} ${map.filter((item) => item.primary_section === name).length}`).join(" / ")}.`,
);

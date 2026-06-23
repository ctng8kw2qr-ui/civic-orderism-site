#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_PATH =
  process.env.INTRODUCTION_MANUAL_SOURCE ||
  path.join(__dirname, "source", "introduction-manual.txt");
const REFERENCE_HTML = path.join(
  ROOT,
  "quartz",
  "static",
  "files",
  "civic-orderism-organization-manual.html",
);
const LOGO_PATH = path.join(ROOT, "quartz", "static", "logo.png");
const HTML_PATH = path.join(
  ROOT,
  "quartz",
  "static",
  "files",
  "civic-orderism-introduction-manual-source.html",
);
const PDF_PATH = path.join(
  ROOT,
  "quartz",
  "static",
  "files",
  "civic-orderism-introduction-manual.pdf",
);
const ARCHITECTURE_IMAGE_PATH = path.join(
  ROOT,
  "quartz",
  "static",
  "files",
  "civic-orderism-architecture-final-preview.png",
);
const NODE_MODULES =
  process.env.NODE_PATH ||
  "/Users/zhaopengbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const BROWSERS_PATH =
  process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(ROOT, "work", "playwright-browsers");

const chapterQuestions = new Map([
  ["前言：公民秩序主义要回答什么问题", "国家为什么存在，制度服务于谁，权力如何被组织、监督和纠正？"],
  ["公民秩序主义的基本理念", "公民、制度、责任与公共秩序之间应当建立怎样的关系？"],
  ["公民秩序主义的核心制度设计", "一套可解释、可追责、可纠错的现代国家系统如何具体运行？"],
  ["公民秩序主义的时代意义", "信息化时代为何需要超越旧式政党对抗，转向国家系统升级？"],
  ["结语：从权力崇拜走向制度秩序", "如何从依赖人物、口号和动员，走向可持续运行的制度秩序？"],
]);

const toc = [
  {
    number: "00",
    title: "前言",
    page: "4",
    items: [["", "公民秩序主义要回答什么问题", "4"]],
  },
  {
    number: "01",
    title: "公民秩序主义的基本理念",
    page: "5",
    items: [
      ["1.1", "人民高于一切，制度服务生活", "5"],
      ["1.2", "反训政、反家长制、反“为了你好”", "6"],
      ["1.3", "透明、公开、可追责", "6"],
      ["1.4", "不靠圣贤，靠结构", "7"],
      ["1.5", "降低社会摩擦", "8"],
    ],
  },
  {
    number: "02",
    title: "公民秩序主义的核心制度设计",
    page: "9",
    items: [
      ["2.0", "制度总览：整体架构示意图", "9"],
      ["2.1", "双轨结构：行政线与委员会线", "10"],
      ["2.2", "委员会系统：国家的感知与校正机制", "11"],
      ["2.3", "公民秩序培训学院：培养公共能力", "12"],
      ["2.4", "秘书处：国家的神经系统", "13"],
      ["2.5", "前端系统：让公民有门可进", "14"],
      ["2.6", "后台支持系统：国家运行的底层基础设施", "14"],
      ["2.7", "现代隐形权力节点监督", "15"],
      ["2.8", "司法与廉正系统：程序边界与自我净化", "16"],
    ],
  },
  {
    number: "03",
    title: "公民秩序主义的时代意义",
    page: "17",
    items: [
      ["3.1", "政党政治正在错配信息化时代", "17"],
      ["3.2", "国家间的竞争，本质上是制度竞争", "18"],
    ],
  },
  {
    number: "—",
    title: "结语",
    page: "19",
    items: [["", "从权力崇拜走向制度秩序", "19"]],
  },
  {
    number: "C",
    title: "联系方式",
    page: "20",
    items: [],
  },
];

const chapterMeta = new Map([
  ["前言：公民秩序主义要回答什么问题", ["00", "前言：公民秩序主义要回答什么问题"]],
  ["公民秩序主义的基本理念", ["01", "公民秩序主义的基本理念"]],
  ["公民秩序主义的核心制度设计", ["02", "公民秩序主义的核心制度设计"]],
  ["公民秩序主义的时代意义", ["03", "公民秩序主义的时代意义"]],
  ["结语：从权力崇拜走向制度秩序", ["结语", "从权力崇拜走向制度秩序"]],
]);

const emphasizedLines = new Set([
  "人民高于一切，制度服务生活。",
  "国家不能替人民永久作主，但国家必须替人民承担制度复杂度。",
  "国家承担公共责任，人民保有判断与尊严。",
  "行政执行线与委员会判断线并行。",
  "行政线负责行动。",
  "委员会线负责判断。",
  "行政线让国家动起来；",
  "委员会线防止国家一路失真。",
  "没有行政线，国家会虚；",
  "没有委员会线，国家会盲。",
  "秘书处不是普通文书机关，而是国家的神经系统。",
  "制度是国家的操作系统。",
  "国家间的竞争，归根到底是制度的竞争。",
  "公民秩序主义不是情绪出口，而是制度入口。",
]);

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function readReferenceStyle() {
  const html = fs.readFileSync(REFERENCE_HTML, "utf8");
  const match = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!match) {
    throw new Error("未能从《组织手册》HTML 中读取参考样式。");
  }
  return match[1];
}

function parseSource() {
  const raw = fs.readFileSync(SOURCE_PATH, "utf8").replace(/\r\n/g, "\n");
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line !== "⸻");

  if (
    lines[0] !== "公民秩序主义介绍手册" ||
    lines[1] !== "信息化时代的国家秩序方案"
  ) {
    throw new Error("正文标题与预期不一致，请确认使用的是最新版介绍手册。");
  }

  return lines.slice(2);
}

function isMainMarker(line) {
  return /^(第一部分|第二部分|第三部分)$/.test(line);
}

function isSubheading(line) {
  return /^[一二三四五六七八九十]+、/.test(line);
}

function isNumberedSubheading(line) {
  return /^[1-9]\.\s*/.test(line);
}

const listBlocks = new Map([
  ["普通人遇到问题时，是否有地方可以说理？", { count: 4, includeFirst: true }],
  ["如果预算复杂，国家应当提供可理解的预算说明；", { count: 4, includeFirst: true }],
  ["任何重要公共事项，都应尽可能回答：", { count: 7 }],
  ["好的制度，应该做到：", { count: 6 }],
  ["所谓社会摩擦，就是普通人在面对制度时不断感受到的障碍：", { count: 9 }],
  ["它的任务是感知基层问题：", { count: 5 }],
  ["它要判断：", { count: 4 }],
  ["主要训练内容包括：", { count: 9 }],
  ["不同层级的委员，需要接受不同训练：", { count: 5 }],
  ["秘书处的核心职责包括：", { count: 7 }],
  ["前端系统包括：", { count: 5 }],
  ["后台支持系统包括：", { count: 11 }],
  ["因此，后台系统必须做到：", { count: 6 }],
  ["这些节点不一定发布命令，却可以影响：", { count: 7 }],
  ["基本原则包括：", { count: 8 }],
  ["你必须选择左或右；", { count: 4, includeFirst: true }],
  ["人口多，不等于国家强；", { count: 3, includeFirst: true }],
  ["好的制度能降低社会摩擦；", { count: 6, includeFirst: true }],
  ["它不是简单反对，而是长期建设；", { count: 3, includeFirst: true }],
  ["一个真正成熟的国家，应当做到：", { count: 6 }],
]);

function renderChapterOpener(key, partMarker = "") {
  const [number, title] = chapterMeta.get(key);
  return `
    <section class="chapter">
      <header class="chapter-opener">
        <div class="chapter-index">${number}</div>
        <div class="chapter-heading">
          <div class="eyebrow">${partMarker ? `${escapeHtml(partMarker)} · ` : ""}CIVIC ORDERISM · INTRODUCTION MANUAL</div>
          <h1>${escapeHtml(title)}</h1>
          <p class="chapter-question"><span>本章回答</span>${escapeHtml(chapterQuestions.get(key))}</p>
        </div>
      </header>`;
}

function renderArchitecturePage() {
  return `
  <section class="architecture-page">
    <div class="folio">INSTITUTIONAL ARCHITECTURE · 制度总览</div>
    <header class="architecture-header">
      <h1>公民秩序主义整体架构示意图</h1>
      <h2>Civic Orderism Institutional Architecture</h2>
      <p>以公民输入为起点，以秘书处串联系统，以权责分立为原则，以责任回流为闭环。</p>
    </header>

    <div class="architecture-diagram">
      <div class="arch-loop" aria-hidden="true"><span>责任回流</span></div>

      <div class="arch-card arch-wide arch-civil">
        <div class="arch-card-head">
          <strong>公民与社会</strong>
          <span>Civil Society</span>
        </div>
        <p>公民、家庭、社区、企业、媒体、社会组织</p>
        <small>提出需求、问题、建议、监督与反馈</small>
      </div>

      <div class="arch-arrow"><span>输入</span></div>

      <div class="arch-card arch-wide arch-front">
        <div class="arch-card-head">
          <strong>前端机构</strong>
          <span>Front-End Interface</span>
        </div>
        <p>接收诉求、编号分流、公开进度</p>
        <small>入口 / 分流 / 留痕 / 公开</small>
      </div>

      <div class="arch-arrow"><span>分流</span></div>

      <div class="arch-hub">
        <div class="arch-hub-title">
          <strong>秘书处</strong>
          <span>Secretariat — System Connector</span>
        </div>
        <p>串联系统、协调流程、整合信息、管理议程、跟踪事项、保障连续</p>
        <small>串联 / 协调 / 留痕 / 连续</small>
      </div>

      <div class="arch-governance-grid">
        <div class="arch-card arch-governance">
          <div class="arch-card-head">
            <strong>民选政治首长</strong>
            <span>Elected Leadership</span>
          </div>
          <p>提出方向、组织施政、承担政治责任</p>
          <small>方向 / 领导 / 施政 / 负责</small>
        </div>
        <div class="arch-card arch-governance">
          <div class="arch-card-head">
            <strong>行政系统</strong>
            <span>Administrative System</span>
          </div>
          <p>执行政策、提供服务、日常治理</p>
          <small>执行 / 服务 / 治理</small>
        </div>
        <div class="arch-card arch-governance">
          <div class="arch-card-head">
            <strong>大议会</strong>
            <span>Grand Assembly</span>
          </div>
          <p>公共授权、公共判断、程序压印、政治问责</p>
          <small>授权 / 判断 / 压印 / 问责</small>
        </div>
        <div class="arch-card arch-governance">
          <div class="arch-card-head">
            <strong>委员会系统</strong>
            <span>Committee System</span>
          </div>
          <p>监督运行、判断纠偏、责任追踪</p>
          <small>监督 / 判断 / 纠偏 / 问责</small>
        </div>
      </div>

      <div class="arch-governance-note">
        <strong>方向由民选首长提出，执行由行政系统承担，授权与问责由大议会完成，监督与纠偏由委员会系统负责。</strong>
        <span>Direction — Execution — Authorization &amp; Accountability — Supervision &amp; Correction</span>
      </div>

      <div class="arch-connector-labels">
        <span>方向</span>
        <span>执行</span>
        <span>授权</span>
        <span>监督</span>
      </div>

      <div class="arch-card arch-wide arch-support">
        <div class="arch-card-head">
          <strong>后台支撑系统</strong>
          <span>Support System</span>
        </div>
        <p>数据系统、AI 审计、链上记录、档案与知识库、安全与隐私保护</p>
        <small>提供技术、数据、审计、记录和归档支撑</small>
      </div>

      <div class="arch-arrow arch-arrow-soft"><span>支撑 / 记录</span></div>

      <div class="arch-card arch-wide arch-feedback">
        <div class="arch-card-head">
          <strong>责任回流</strong>
          <span>Accountability Feedback Loop</span>
        </div>
        <p>公开解释、责任追踪、制度修正、公民反馈</p>
        <small>权力可见、程序可查、责任可追、问题可回流</small>
      </div>
    </div>

    <p class="architecture-note">
      “公民秩序主义并不把国家运行寄托于单一权力中心，而是将输入、执行、授权、判断、监督、问责与反馈拆分为可追踪的制度环节。秘书处作为国家运行枢纽，负责串联系统、协调流程、整合信息与保障连续；民选政治首长负责方向与施政，行政系统负责执行与服务，大议会承担公共授权、公共判断、程序压印与政治问责，委员会系统负责监督、纠偏与责任追踪。最终形成权力可见、程序可查、责任可追、问题可回流的国家运行结构。”
    </p>
  </section>`;
}

function renderBody(lines) {
  let html = "";
  let chapterOpen = false;
  let sectionOpen = false;
  const closeSection = () => {
    if (sectionOpen) {
      html += "</section>";
      sectionOpen = false;
    }
  };
  const closeChapter = () => {
    closeSection();
    if (chapterOpen) {
      html += "</section>";
      chapterOpen = false;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const next = lines[i + 1];

    if (line.startsWith("前言：") || line.startsWith("结语：")) {
      closeChapter();
      html += renderChapterOpener(line);
      chapterOpen = true;
      continue;
    }

    if (isMainMarker(line)) {
      closeChapter();
      const title = next;
      if (title === "公民秩序主义的核心制度设计") {
        html += renderArchitecturePage();
      }
      html += renderChapterOpener(title, line);
      chapterOpen = true;
      i += 1;
      continue;
    }

    if (isSubheading(line)) {
      closeSection();
      html += `<section class="content-section"><h2>${escapeHtml(line)}</h2>`;
      sectionOpen = true;
      continue;
    }

    if (isNumberedSubheading(line)) {
      html += `<h3>${escapeHtml(line)}</h3>`;
      continue;
    }

    const listBlock = listBlocks.get(line);
    if (listBlock) {
      const start = listBlock.includeFirst ? i : i + 1;
      const items = lines.slice(start, start + listBlock.count);
      const intro = listBlock.includeFirst ? "" : line;
      html += `
        <div class="list-module">
          ${intro ? `<p class="list-intro">${escapeHtml(intro)}</p>` : ""}
          <ul class="plain-list">
            ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>`;
      i = start + listBlock.count - 1;
      continue;
    }

    if (emphasizedLines.has(line)) {
      const quotes = [line];
      while (i + 1 < lines.length && emphasizedLines.has(lines[i + 1])) {
        quotes.push(lines[i + 1]);
        i += 1;
      }
      html += `<blockquote class="quote-stack">${quotes
        .map((quote) => `<span>${escapeHtml(quote)}</span>`)
        .join("")}</blockquote>`;
    } else {
      html += `<p>${escapeHtml(line)}</p>`;
    }
  }

  closeChapter();
  return html;
}

function buildHtml(lines) {
  const referenceStyle = readReferenceStyle();
  const logoData = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}`;
  const tocHtml = toc
    .map(
      ({ number, title, page, items }) => `
        <section class="toc-group">
          <header><span>${number}</span><strong>${title}</strong><em>${page}</em></header>
          ${
            items.length
              ? `<div class="toc-subitems">${items
                  .map(
                    ([num, label, itemPage]) =>
                      `<div><b>${num}</b><span>${escapeHtml(label)}</span><em>${itemPage}</em></div>`,
                  )
                  .join("")}</div>`
              : ""
          }
        </section>`,
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>公民秩序主义介绍手册</title>
  <style>
${referenceStyle}
    .cover-main { margin-top: 39mm; }
    .cover h1 { font-size: 30pt; }
    .cover-meta {
      grid-template-columns: 1fr;
      gap: 2.2mm;
      font-size: 9.2pt;
    }
    .cover-contact-title {
      color: var(--gold-light);
      font: 700 7.2pt/1 Arial, sans-serif;
      letter-spacing: .18em;
      text-transform: uppercase;
    }
    .cover-contact-lines,
    .contact-lines,
    .back-contact-lines {
      display: grid;
      grid-template-columns: 28mm 1fr;
      gap: 2.2mm 5mm;
    }
    .cover-contact-lines span,
    .back-contact-lines span { color: #b9c6d4; }
    .cover-contact-lines strong,
    .back-contact-lines strong { color: white; font-weight: 500; }
    .introduction-note .statement { font-size: 11pt; }
    .introduction-note .statement strong { color: var(--navy); }
    .page-watermark {
      inset: 51% auto auto 50%;
      color: rgba(10, 29, 56, .022);
      font-size: 31pt;
    }
    .toc-page { padding: 22mm 22mm 13mm; }
    .toc-page h1 { margin-bottom: 8mm; }
    .toc-groups {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: start;
      gap: 5mm 9mm;
    }
    .toc-group {
      padding: 0 0 4mm;
      border-bottom: .25mm solid var(--line);
      break-inside: avoid;
    }
    .toc-group header {
      display: grid;
      grid-template-columns: 12mm 1fr 7mm;
      align-items: baseline;
      gap: 1.2mm;
      margin-bottom: 2mm;
    }
    .toc-group header span {
      color: var(--gold);
      font: 700 8.5pt Arial, sans-serif;
    }
    .toc-group header strong {
      color: var(--navy);
      font-size: 10.2pt;
      line-height: 1.4;
    }
    .toc-group header em {
      color: #9a8a62;
      font: 700 7.3pt Arial, sans-serif;
      text-align: right;
      font-style: normal;
    }
    .toc-subitems {
      display: grid;
      gap: 1.2mm;
      margin-left: 12mm;
    }
    .toc-subitems div {
      display: grid;
      grid-template-columns: 9mm 1fr 6mm;
      gap: 1mm;
      color: var(--muted);
      font-size: 7.7pt;
      line-height: 1.45;
    }
    .toc-subitems b {
      color: #8c7950;
      font: 600 7.2pt Arial, sans-serif;
    }
    .toc-subitems em {
      color: #9aa4ae;
      font: 600 6.8pt Arial, sans-serif;
      text-align: right;
      font-style: normal;
    }
    .chapter { padding-bottom: 16mm; }
    .content-section { margin-bottom: 8mm; }
    .content-section > p { line-height: 1.75; margin-bottom: 4.1mm; }
    .content-section h2 { margin-top: 9mm; }
    .content-section h3 { margin-top: 6mm; }
    .quote-stack {
      padding-top: 4.5mm;
      padding-bottom: 4.5mm;
    }
    .quote-stack span { display: block; }
    .quote-stack span + span { margin-top: 1.3mm; }
    .list-module {
      margin: 3.5mm 0 5mm;
      padding: 3.2mm 4mm;
      background: #f4f6f8;
      border-left: .65mm solid #b9c3ce;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .list-intro {
      margin: 0 0 2mm;
      color: var(--navy);
      font-weight: 650;
      text-align: left;
    }
    .plain-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      grid-template-columns: 1fr;
      gap: .7mm;
    }
    .plain-list li {
      position: relative;
      margin: 0;
      padding: .7mm 1.8mm .7mm 5.5mm;
      background: rgba(255,255,255,.72);
      border: .2mm solid #e3e7eb;
      break-inside: avoid;
      page-break-inside: avoid;
      line-height: 1.48;
    }
    .plain-list li::before {
      content: "";
      position: absolute;
      left: 2.3mm;
      top: 3mm;
      width: 1mm;
      height: 1mm;
      border-radius: 50%;
      background: var(--gold);
    }
    .contact-section {
      margin-top: 12mm;
      padding: 9mm;
      background: linear-gradient(135deg, #f1f4f7, #fafbfc);
      border-top: .8mm solid var(--navy);
      break-inside: avoid;
    }
    .contact-section h2 {
      margin-top: 0;
      letter-spacing: .08em;
    }
    .contact-section a { color: inherit; text-decoration: none; }
    .contact-lines {
      grid-template-columns: 26mm 1fr;
      gap: 2.5mm 5mm;
      margin-top: 6mm;
      font-size: 10.4pt;
    }
    .contact-lines span { color: var(--muted); }
    .back-contact {
      position: absolute;
      left: 25mm;
      bottom: 42mm;
      color: #d5dee8;
      font-size: 9.2pt;
      line-height: 1.5;
    }
    .back-contact-title {
      margin-bottom: 4mm;
      color: var(--gold-light);
      font: 700 7.2pt/1 Arial, sans-serif;
      letter-spacing: .18em;
      text-transform: uppercase;
    }
    .architecture-page {
      position: relative;
      box-sizing: border-box;
      padding: 9mm 16mm 7mm;
      background:
        linear-gradient(90deg, rgba(12, 35, 64, .025) 1px, transparent 1px),
        linear-gradient(0deg, rgba(12, 35, 64, .025) 1px, transparent 1px),
        #fbfcfd;
      background-size: 9mm 9mm;
      break-before: page;
      page-break-before: always;
      break-after: page;
      page-break-after: always;
    }
    .architecture-header {
      margin-bottom: 3.4mm;
      padding-bottom: 2.2mm;
      border-bottom: .35mm solid var(--line);
    }
    .architecture-header h1 {
      margin: 0 0 1mm;
      color: var(--navy);
      font-size: 19pt;
      letter-spacing: .02em;
    }
    .architecture-header h2 {
      margin: 0 0 2.2mm;
      color: #667483;
      font: 600 8.5pt Arial, sans-serif;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .architecture-header p {
      margin: 0;
      color: #2f3f4f;
      font-size: 9.6pt;
      line-height: 1.45;
    }
    .architecture-diagram {
      position: relative;
      display: grid;
      grid-template-columns: 1fr;
      gap: 1mm;
      padding: 1mm 12mm 1mm 0;
    }
    .arch-card,
    .arch-hub {
      position: relative;
      z-index: 1;
      box-sizing: border-box;
      border: .25mm solid #d7dde4;
      border-radius: 2.5mm;
      background: rgba(255,255,255,.95);
      box-shadow: 0 1.2mm 3.6mm rgba(10, 29, 56, .035);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .arch-card {
      padding: 2.6mm 3.9mm;
    }
    .arch-card::before,
    .arch-hub::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 1.2mm;
      border-radius: 2.5mm 0 0 2.5mm;
      background: #aebbc8;
    }
    .arch-civil::before { background: #7890a8; }
    .arch-front::before { background: #9aabb9; }
    .arch-support::before { background: #8fa1b1; }
    .arch-feedback::before { background: #6f8a7b; }
    .arch-wide {
      display: grid;
      grid-template-columns: 42mm 1fr 44mm;
      align-items: center;
      gap: 4mm;
      min-height: 13.8mm;
    }
    .arch-card-head strong,
    .arch-hub-title strong {
      display: block;
      margin-bottom: .8mm;
      color: var(--navy);
      font-size: 10pt;
      line-height: 1.25;
    }
    .arch-card-head span,
    .arch-hub-title span {
      display: block;
      color: #788592;
      font: 600 6.2pt Arial, sans-serif;
      letter-spacing: .06em;
      line-height: 1.32;
    }
    .arch-card p,
    .arch-hub p {
      margin: 0;
      color: #303b46;
      font-size: 8.35pt;
      line-height: 1.38;
      text-align: left;
    }
    .arch-card small,
    .arch-hub small {
      display: block;
      color: #687787;
      font-size: 6.45pt;
      line-height: 1.35;
      text-align: left;
    }
    .arch-arrow {
      position: relative;
      height: 4.8mm;
      color: #71808f;
      text-align: center;
      font-size: 6.8pt;
      line-height: 1;
    }
    .arch-arrow::before {
      content: "";
      position: absolute;
      left: 50%;
      top: .2mm;
      bottom: 1.2mm;
      border-left: .3mm solid #aab5c0;
    }
    .arch-arrow::after {
      content: "";
      position: absolute;
      left: calc(50% - 1.25mm);
      bottom: .4mm;
      width: 2.2mm;
      height: 2.2mm;
      border-right: .3mm solid #aab5c0;
      border-bottom: .3mm solid #aab5c0;
      transform: rotate(45deg);
    }
    .arch-arrow span {
      position: relative;
      z-index: 1;
      display: inline-block;
      margin-top: .85mm;
      padding: .45mm 2mm;
      background: #fbfcfd;
      color: #697987;
      letter-spacing: .05em;
    }
    .arch-arrow-soft {
      height: 4.2mm;
    }
    .arch-hub {
      margin: 1mm 18mm 2mm;
      padding: 3.2mm 4.8mm;
      border-color: #b9c6d2;
      background: linear-gradient(135deg, #eef4f3, #ffffff);
      text-align: center;
    }
    .arch-hub::before {
      background: #6f8a7b;
    }
    .arch-hub-title {
      margin-bottom: 1.3mm;
    }
    .arch-hub-title strong {
      font-size: 12pt;
    }
    .arch-hub p,
    .arch-hub small {
      text-align: center;
    }
    .arch-governance-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.4mm 5.5mm;
      margin-top: .8mm;
    }
    .arch-governance-grid::before {
      content: "";
      position: absolute;
      left: 50%;
      top: -6.2mm;
      bottom: -4mm;
      border-left: .28mm solid #ccd5dd;
      z-index: -1;
    }
    .arch-governance-grid::after {
      content: "";
      position: absolute;
      left: 18%;
      right: 18%;
      top: -4.1mm;
      border-top: .28mm solid #ccd5dd;
      z-index: -1;
    }
    .arch-governance {
      min-height: 20.5mm;
      padding: 2.9mm 3.8mm;
    }
    .arch-governance p {
      margin-top: 2mm;
      min-height: 5.2mm;
    }
    .arch-governance small {
      margin-top: 1.2mm;
      padding-top: 1.1mm;
      border-top: .22mm solid #e4e9ee;
      color: #6e7d8c;
    }
    .arch-connector-labels {
      display: none;
      grid-template-columns: repeat(4, 1fr);
      gap: 2mm;
      margin: 1mm 6mm .2mm;
      color: #758493;
      font-size: 6.7pt;
      letter-spacing: .08em;
      text-align: center;
    }
    .arch-governance-note {
      margin: 1.4mm 6mm .6mm;
      padding: 2.2mm 4mm;
      border: .24mm solid #d6dee6;
      border-radius: 1.8mm;
      background: rgba(239, 244, 248, .92);
      color: #334252;
      text-align: center;
    }
    .arch-governance-note strong {
      display: block;
      font-size: 8pt;
      font-weight: 650;
      line-height: 1.35;
    }
    .arch-governance-note span {
      display: block;
      margin-top: .7mm;
      color: #748291;
      font: 600 5.2pt Arial, sans-serif;
      letter-spacing: .06em;
      line-height: 1.2;
    }
    .arch-support {
      margin-top: .5mm;
    }
    .arch-loop {
      position: absolute;
      top: 8mm;
      right: 0;
      bottom: 9mm;
      width: 10mm;
      border: .32mm solid #9aabbb;
      border-left: 0;
      border-radius: 0 8mm 8mm 0;
      opacity: .86;
    }
    .arch-loop::before {
      content: "";
      position: absolute;
      top: -1.8mm;
      left: -1.2mm;
      width: 3mm;
      height: 3mm;
      border-left: .32mm solid #9aabbb;
      border-bottom: .32mm solid #9aabbb;
      transform: rotate(45deg);
      background: #fbfcfd;
    }
    .arch-loop span {
      position: absolute;
      right: -4.6mm;
      top: 50%;
      padding: 1mm 0;
      color: #758493;
      font-size: 6.7pt;
      letter-spacing: .08em;
      writing-mode: vertical-rl;
      transform: translateY(-50%);
    }
    .arch-node,
    .arch-dual-layer {
      position: relative;
      z-index: 1;
      border: .28mm solid #d7dde4;
      border-radius: 2.8mm;
      background: rgba(255,255,255,.94);
      box-shadow: 0 1.4mm 4mm rgba(10, 29, 56, .035);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .arch-node {
      display: grid;
      grid-template-columns: 54mm 1fr;
      align-items: center;
      min-height: 15mm;
      padding: 3mm 4.5mm;
    }
    .arch-node::before,
    .arch-dual-layer::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 1.3mm;
      border-radius: 2.8mm 0 0 2.8mm;
      background: #aebbc8;
    }
    .arch-node-society::before { background: #7890a8; }
    .arch-node-feedback::before { background: #6f8a7b; }
    .arch-node strong,
    .arch-dual-title strong {
      display: block;
      margin-bottom: 1mm;
      color: var(--navy);
      font-size: 10.5pt;
      line-height: 1.25;
    }
    .arch-node span,
    .arch-dual-title span,
    .arch-track span {
      display: block;
      color: #788592;
      font: 600 6.2pt Arial, sans-serif;
      letter-spacing: .06em;
      line-height: 1.35;
    }
    .arch-node p {
      margin: 0;
      color: #303b46;
      font-size: 9pt;
      line-height: 1.55;
      text-align: left;
    }
    .arch-flow {
      position: relative;
      height: 7.6mm;
      color: #71808f;
      text-align: center;
      font-size: 7pt;
      line-height: 1;
    }
    .arch-flow::before {
      content: "";
      position: absolute;
      left: 50%;
      top: .4mm;
      bottom: 1.5mm;
      border-left: .32mm solid #aab5c0;
    }
    .arch-flow::after {
      content: "";
      position: absolute;
      left: calc(50% - 1.35mm);
      bottom: .6mm;
      width: 2.4mm;
      height: 2.4mm;
      border-right: .32mm solid #aab5c0;
      border-bottom: .32mm solid #aab5c0;
      transform: rotate(45deg);
    }
    .arch-flow span {
      position: relative;
      z-index: 1;
      display: inline-block;
      margin-top: 1.55mm;
      padding: .7mm 2.4mm;
      background: #fbfcfd;
      color: #697987;
      letter-spacing: .04em;
    }
    .arch-dual-layer {
      padding: 3.5mm 4.5mm 4mm;
      border-color: #b9c6d2;
      background: linear-gradient(135deg, #f1f5f8, #ffffff);
    }
    .arch-dual-layer::before { background: var(--gold); }
    .arch-dual-title {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 6mm;
      margin-bottom: 3mm;
      padding-left: 1mm;
    }
    .arch-track-grid {
      display: grid;
      grid-template-columns: 1fr 26mm 1fr;
      align-items: stretch;
      gap: 2.8mm;
    }
    .arch-track {
      padding: 3.2mm;
      border: .25mm solid #d6dde3;
      border-radius: 2mm;
      background: rgba(255,255,255,.9);
    }
    .arch-track h3 {
      margin: 0 0 .8mm;
      color: var(--navy);
      font-size: 10pt;
      line-height: 1.35;
    }
    .arch-track ul {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.3mm;
      margin: 2.7mm 0 0;
      padding: 0;
      list-style: none;
    }
    .arch-track li {
      margin: 0;
      padding: 1.5mm 1.8mm;
      border: .22mm solid #e2e7ec;
      background: #f7f9fb;
      color: #303b46;
      font-size: 8.2pt;
      line-height: 1.3;
      text-align: center;
    }
    .arch-track-bridge {
      position: relative;
      align-self: center;
      display: grid;
      gap: 1.35mm;
      color: #526273;
      font-size: 7.2pt;
      text-align: center;
    }
    .arch-track-bridge::before,
    .arch-track-bridge::after {
      content: "";
      position: absolute;
      top: 50%;
      width: 8mm;
      border-top: .3mm solid #9baaba;
    }
    .arch-track-bridge::before {
      left: -7mm;
    }
    .arch-track-bridge::after {
      right: -7mm;
    }
    .arch-track-bridge div {
      padding: 1.2mm 1mm;
      border: .22mm solid #d9e0e6;
      border-radius: 20mm;
      background: #fbfcfd;
      white-space: nowrap;
    }
    .arch-return-loop {
      position: absolute;
      top: 8mm;
      right: 0;
      bottom: 9mm;
      width: 10mm;
      border: .32mm solid #9aabbb;
      border-left: 0;
      border-radius: 0 8mm 8mm 0;
      opacity: .86;
    }
    .arch-return-loop::before {
      content: "";
      position: absolute;
      top: -1.8mm;
      left: -1.2mm;
      width: 3mm;
      height: 3mm;
      border-left: .32mm solid #9aabbb;
      border-bottom: .32mm solid #9aabbb;
      transform: rotate(45deg);
      background: #fbfcfd;
    }
    .arch-return-loop span {
      position: absolute;
      right: -4.6mm;
      top: 50%;
      padding: 1mm 0;
      color: #758493;
      font-size: 6.7pt;
      letter-spacing: .08em;
      writing-mode: vertical-rl;
      transform: translateY(-50%);
    }
    .architecture-note {
      margin: 2.8mm 0 0;
      padding: 2.5mm 4mm;
      border-top: .55mm solid #b9aa7a;
      background: rgba(255,255,255,.88);
      color: #384654;
      font-size: 6.9pt;
      line-height: 1.55;
      text-align: left;
    }
    @media print {
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>
  <div class="page-watermark">CIVIC ORDERISM</div>

  <section class="cover">
    <div class="cover-brand">
      <img class="cover-logo" src="${logoData}" alt="公民秩序主义 logo">
      <div class="cover-brand-text"><strong>公民秩序主义</strong><span>CIVIC ORDERISM</span></div>
    </div>
    <div class="cover-main">
      <div class="cover-kicker">INTRODUCTION MANUAL · 2026</div>
      <h1>公民秩序主义<br>介绍手册</h1>
      <h2>Civic Orderism Introduction Manual</h2>
      <div class="cover-tagline">信息化时代的国家秩序方案</div>
    </div>
    <div class="cover-meta">
      <div class="cover-contact-title">联系方式 / Contact</div>
      <div class="cover-contact-lines">
        <span>X 平台 / X</span><strong>@CivicOrderism</strong>
        <span>邮箱 / Email</span><strong>citizenorder@proton.me</strong>
        <span>备用邮箱 / Backup Email</span><strong>civicorderism@gmail.com</strong>
        <span>网站 / Website</span><strong>https://civicorderism.com/</strong>
      </div>
    </div>
  </section>

  <section class="front-page introduction-note">
    <div class="folio">DOCUMENT NOTE · 文件说明</div>
    <h1>关于本手册</h1>
    <div class="statement">
      <p>本手册用于系统介绍公民秩序主义的基本理念、核心制度设计与时代意义。</p>
      <p>它关注的不是权力动员，而是国家为什么存在、制度服务于谁，以及权力如何被组织、监督和纠正。</p>
      <p><strong>公民秩序主义主张以公民为主体，以秩序为基础，以制度为工具，以责任为核心。</strong></p>
      <p>本文件适合用于理念说明、制度讨论与对外传播。</p>
    </div>
    <p class="copyright-note">© 2026 Civic Orderism. 本手册用于理念说明与制度讨论。内容可在尊重原意和来源的前提下用于学习与传播。</p>
  </section>

  <section class="front-page toc-page">
    <div class="folio">CONTENTS · 目录</div>
    <h1>内容结构</h1>
    <div class="toc-groups">${tocHtml}</div>
  </section>

  ${renderBody(lines)}

  <section class="chapter contact-chapter">
    <header class="chapter-opener">
      <div class="chapter-index">C</div>
      <div class="chapter-heading">
        <div class="eyebrow">CIVIC ORDERISM · CONTACT</div>
        <h1>联系方式 / Contact</h1>
        <p class="chapter-question"><span>保持联系</span>严肃交流、资料反馈与建设性讨论，可通过以下方式联系。</p>
      </div>
    </header>
    <div class="contact-section">
      <h2>联系方式 / Contact</h2>
      <div class="contact-lines">
        <span>X 平台 / X</span><strong><a href="https://x.com/CivicOrderism">@CivicOrderism</a></strong>
        <span>邮箱 / Email</span><strong><a href="mailto:citizenorder@proton.me">citizenorder@proton.me</a></strong>
        <span>备用邮箱 / Backup Email</span><strong><a href="mailto:civicorderism@gmail.com">civicorderism@gmail.com</a></strong>
        <span>网站 / Website</span><strong><a href="https://civicorderism.com/">https://civicorderism.com/</a></strong>
      </div>
    </div>
  </section>

  <section class="back-cover">
    <img src="${logoData}" alt="公民秩序主义 logo">
    <h1>公民秩序主义</h1>
    <h2>CIVIC ORDERISM</h2>
    <div class="back-line"></div>
    <div class="positioning">
      <strong>信息化时代的国家秩序方案</strong><br><br>
      以公民为主体，以秩序为基础，<br>
      以制度为工具，以责任为核心。
    </div>
    <div class="back-contact">
      <div class="back-contact-title">联系方式 / Contact</div>
      <div class="back-contact-lines">
        <span>X 平台 / X</span><strong>@CivicOrderism</strong>
        <span>邮箱 / Email</span><strong>citizenorder@proton.me</strong>
        <span>备用邮箱 / Backup Email</span><strong>civicorderism@gmail.com</strong>
        <span>网站 / Website</span><strong>https://civicorderism.com/</strong>
      </div>
    </div>
    <div class="back-final">从权力崇拜走向制度秩序。</div>
  </section>
</body>
</html>`;
}

async function main() {
  if (!fs.existsSync(REFERENCE_HTML)) {
    throw new Error("未找到《组织手册》HTML 源文件，无法保证版式一致。");
  }
  const lines = parseSource();
  fs.mkdirSync(path.dirname(HTML_PATH), { recursive: true });
  fs.writeFileSync(HTML_PATH, buildHtml(lines), "utf8");

  const playwright = require(path.join(NODE_MODULES, "playwright"));
  const fullChromiumPath = path.join(
    BROWSERS_PATH,
    "chromium-1223",
    "chrome-mac-arm64",
    "Google Chrome for Testing.app",
    "Contents",
    "MacOS",
    "Google Chrome for Testing",
  );
  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: fs.existsSync(fullChromiumPath) ? fullChromiumPath : undefined,
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1800 },
    deviceScaleFactor: 1,
  });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.locator(".architecture-page").screenshot({
    path: ARCHITECTURE_IMAGE_PATH,
    type: "png",
  });
  await page.pdf({
    path: PDF_PATH,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    preferCSSPageSize: true,
    margin: { top: "10mm", bottom: "12mm", left: "0", right: "0" },
    headerTemplate: `
      <div style="width:100%;padding:0 18mm;font-family:Arial,sans-serif;font-size:7px;color:#6b7582;display:flex;justify-content:space-between;letter-spacing:.08em;">
        <span>公民秩序主义介绍手册</span><span>CIVIC ORDERISM</span>
      </div>`,
    footerTemplate: `
      <div style="width:100%;padding:0 18mm;font-family:Arial,sans-serif;font-size:7px;color:#6b7582;display:flex;justify-content:space-between;letter-spacing:.05em;">
        <span>https://civicorderism.com/</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
  });
  await browser.close();

  console.log(`HTML: ${HTML_PATH}`);
  console.log(`PDF:  ${PDF_PATH}`);
  console.log(`PNG:  ${ARCHITECTURE_IMAGE_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

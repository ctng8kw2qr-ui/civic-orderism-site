# 新文章元数据填写说明

```yaml
---
title: "文章标题"
slug: "可选；通常继续使用文件名生成的稳定 URL"
date: 2026-07-19
updated: 2026-07-19
summary: "用一到三句话说明文章的问题、判断与范围。"
section: "解析中共 | 中国未来 | 公民秩序主义 | 制度设计"
topics:
  - xi-era
concepts:
  - bureaucratic-shock
tags:
  - 普通标签
featured: false
recommended: false
readingLevel: "基础 | 进阶 | 制度"
readingOrder: 999
author: "公民秩序主义"
status: published
needsReview: false
---
```

- `section` 只能选择四个一级栏目之一。
- `topics` 只选择能够形成持续研究线索的专题，不要把普通标签当专题。
- `concepts` 使用 `data/concepts.config.json` 中的 slug。
- `featured` 用于当前重点；`recommended` 用于新读者路线。
- 未核定分类时设置 `needsReview: true`，不要强行分类。
- 发布后尽量不要改变文件路径或 slug；如必须改变，应增加 alias 并记录永久重定向。

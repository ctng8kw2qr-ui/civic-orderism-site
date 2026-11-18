# 《中国经济的未来在哪里？》配图工作单

按 `civic-editorial-illustration` Skill 流程制作（2026-11-18）。本文件与 SVG 母版同目录，
记录概念推导；实际栅格由 `scripts/generate-china-economic-future-cover-svg.py`（母版）
与 `scripts/generate-china-economic-future-cover.mjs`（webp 导出）执行。

## 1. 核心判断（CORE JUDGMENT）

中国真正的增长潜力不在继续扩张钢筋水泥式的统一结构，而在释放 14 亿普通人的
选择与创造力：旧生产方式以组织规模取胜，未来以人的可能性取胜。

## 2. 四个角色

- subject：普通人（功能角色：个体创造者）
- action：从统一的规模化结构中脱离，各自以不同方式立住
- resistance：钢筋水泥式的统一结构与旧组织成本
- result：千千万万个各不相同的新市场与新产物

## 3. 隐喻发散（三个不同物理逻辑）

1. 材料/结构：混凝土板上的方块各自"发芽"，长出的枝顶结着互不相同的几何体。
2. 规模/空间：满载相同方块的传送带旁，几个方块被拨离，在摊位上摆出不同形态。
3. 结构/墙体：一堵相同砖块砌成的长墙，几块砖被取出，各自以不同姿态独立立在地上。

| 候选 | 简洁 | 缩略可读 | 去政治符号 | 去宣传味 | 无文字成立 | 编辑力量 | 陈词扣分 | 小计 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 发芽 | 5 | 4 | 5 | 5 | 5 | 4 | 0 | 28 |
| 2 传送带 | 4 | 3 | 5 | 5 | 4 | 5 | 0 | 26 |
| 3 取砖 | 5 | 5 | 5 | 5 | 5 | 4 | 0 | **29** |

选定：**3 取砖**。承重关系是"脱离—独立立住"：墙体仍在（旧系统），被取出的砖
不再依赖墙，各自站成不同姿态（新个体与新市场）。

## 4. 场景句（SCENE SENTENCE）

一堵由相同深灰砖块砌成的长墙横贯画面下部；墙身有四处空出的砖槽；墙前的地面上，
四块从墙中取出的砖各自独立站立——一块直立、一块横放、一块斜立成菱形，还有一块
直立的小金砖；每块砖都在墙面上投下短而平的影子。

## 5. 弃件清单（Discard list）

不要人物、手、工具、传送带、文字、箭头、旗帜、徽章、制服、警示红、裂缝、坍塌、
渐变、光效与玻璃质感。

## 6. 调色

- 暖白纸底 `#faf8f5`；炭黑砖 `#2e3031`（少量 `#3a3c3e` / `#26282a` 做材质微差）；
- 哑光灰 `#6f6d69`（影子 `#d8d1c4`）；强调色金 `#b3925a` 仅一块砖，面积约 0.7%。

## 7. 构图与规格

- Master：5:2，2000×800；全部关键内容在中央 80% 宽度内。
- 网站版 1600×842 与社交版 1200×630 为居中 cover 裁切（与 BATCH-1 流程一致）。

## 8. 预检（Preflight）

- 无标题能否感到核心矛盾（个体从统一结构中脱离、各自立住）？能。
- 是否一个焦点？是（墙与四块独立的砖）。
- 元素可否再减？砖可减至三块。
- 无信息图/宣传语法？无。
- 移动端 500×200 是否可读？大墙与小砖的尺度对比成立。
- 隐喻是关系而非符号堆砌？是（脱离—独立关系）。

## 9. 可投产提示词（供生成模型复现）

> A single-panel editorial illustration, 5:2 aspect ratio, 2000x800. A long wall
> of identical dark charcoal bricks runs across the lower part of the frame on a
> warm off-white paper background (#faf8f5). Four brick-sized sockets are missing
> from the wall. In front of the wall, on the ground, four bricks taken from the
> wall stand independently, each in a different posture: one upright, one lying
> flat, one tilted as a diamond, and one small gold brick (#b3925a) standing
> upright. Each free brick casts a short flat matte shadow onto the wall face.
> Palette: paper #faf8f5, charcoal #2e3031, matte gray #6f6d69; the gold accent
> covers about 0.7% of the frame. Composition: decisive shapes inside the central
> 80% width and 76% height; strong figure-ground separation; purposeful empty
> paper space above the wall; slight asymmetry; scale contrast between the wall
> mass and the small free bricks. Rendering: sober, calm, restrained original
> editorial illustration, flat matte geometry with a light print feel, no
> gradients, no glossy 3D, no neon, no lens flare, no photoreal stock people.
> Exclusions: no text, letters, numerals, logos, or watermarks; no infographic
> devices — no arrows, labels, callouts, boxes, or charts; no hands, tools,
> uniforms, insignia, flags, maps, emblems, or official buildings; no warning
> red, no cracks, no collapse, no poster rhetoric.

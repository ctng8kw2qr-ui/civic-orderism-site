# validate:v2 · 31条逐项调查

40 → 31 → 0。31项全部也出现在旧 main@36fb221 的失败列表中，不是 B 改版新增回归。A=1，B=30，C=0。未删除测试、未跳过断言、未修改正式政治文本。每项对应原失败信息，原历史报告保留。

## 01 · B · 建立联系页缺少内容：提供意见不产生组织身份

- 文件：`content/participate.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：旧断言逐字匹配独立句；现行“不产生组织身份、成员资格、授权关系或任何正式职务”合并在同一边界段。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。检查同一免责声明中的提供意见、组织身份、成员资格、授权关系、正式职务五项，删除否定语的变异测试必须失败。
- 当前结果：**PASS**。

## 02 · B · 建立联系页缺少内容：建立长期联系

- 文件：`content/participate.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：现有长期联系以“初步沟通→具体协作→明确边界→长期关系”表达，旧断言只找旧标题。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。检查四个阶段全部存在，不修改联系文案。
- 当前结果：**PASS**。

## 03 · B · 建立联系页缺少内容：建立联系不构成成员、志愿者、工作人员、组织代表或任何正式身份

- 文件：`content/participate.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：现行免责声明更换了列举方式，保留不产生身份、资格、授权与正式职务。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。与第1项共同核对完整免责声明，保留独立失败信息。
- 当前结果：**PASS**。

## 04 · B · 建立联系页缺少内容：了解董事会筹备

- 文件：`content/participate.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：实际 CTA 为“了解首届董事会筹备”，比旧句增加“首届”。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。验证现行 CTA 与真实 preparation/board 目标；重定向到错误路径的变异测试必须失败。
- 当前结果：**PASS**。

## 05 · B · 建立联系页缺少内容：董事不会通过公开报名直接产生

- 文件：`content/participate.md`、`content/preparation.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：现行联系页说明正式治理身份须经法律程序；公开报名不产生董事资格的完整边界集中在筹备页。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。同时核对联系页法律程序、董事会入口及筹备页“不通过公开报名”边界；删除边界的变异测试必须失败。
- 当前结果：**PASS**。

## 06 · B · 建立联系页缺少内容：筹备接触不构成任命

- 文件：`content/participate.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：旧“筹备接触不构成任命”被现行身份与正式法律程序条件覆盖。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。同时要求不产生身份/授权及制度和法律程序完成后依章程产生；删除程序条件必须失败。
- 当前结果：**PASS**。

## 07 · B · 法人筹备页顶部状态说明未收紧

- 文件：`content/preparation.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：正式页面已经采用顶部简明状态＋下方组织边界的结构，旧断言要求重复长段。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。核对顶部筹备/未成立/组织边界指引，并核对实际 #boundaries 内未注册、未成立董事会、无资格宣称。
- 当前结果：**PASS**。

## 08 · B · 法人筹备页未按核心信息、当前工作、组织边界、正式文件、建立联系分层

- 文件：`content/preparation.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：旧 indexOf 命中了顶部重复的“筹备不等于已经成立”，未定位实际组织边界段。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。按平衡 HTML 元素提取 #boundaries，再检查为什么现在、法人、董事会、工作、边界、文件、联系的真实顺序。
- 当前结果：**PASS**。

## 09 · B · 法人筹备页未按“组织定位 → 为什么现在 → … → 组织边界”排列定位与法律状态说明

- 文件：`content/preparation.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：现行已发布顺序为为什么现在→组织定位→法人及治理→工作→边界，旧断言仍要求更早的顺序。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。验证实际现行顺序及边界内授权声明；不移动政治或法律段落。
- 当前结果：**PASS**。

## 10 · B · 法人筹备页缺少下一步入口或返回路线的路径

- 文件：`content/preparation.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：旧断言要求已退役的路线 CTA 文案。现有全站导航仍返回路线，底部提供董事会及参与入口。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。核对真实路线、董事会、参与目标，底部两个下一步链接必须实际存在。
- 当前结果：**PASS**。

## 11 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/state-operation-process-under-civic-orderism

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/state-operation-process-under-civic-orderism.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 12 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-dual-track-committee-administration

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-dual-track-committee-administration.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 13 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-not-simple-separation-of-powers

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-not-simple-separation-of-powers.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 14 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/top-level-power-structure-under-civic-orderism

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/top-level-power-structure-under-civic-orderism.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 15 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/what-is-committee-system

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/what-is-committee-system.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 16 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/committee-administration-opposite-incentives

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/committee-administration-opposite-incentives.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 17 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-committees-cannot-directly-take-cases

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-committees-cannot-directly-take-cases.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 18 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/backend-system-under-civic-orderism

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/backend-system-under-civic-orderism.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 19 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/election-logic-under-civic-orderism

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/election-logic-under-civic-orderism.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 20 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-civic-orderism-emphasizes-experience-and-records

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-civic-orderism-emphasizes-experience-and-records.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 21 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-elections-reject-political-donations

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-elections-reject-political-donations.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 22 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-no-bicameral-parliament

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-no-bicameral-parliament.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 23 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-proposals-from-social-organizations

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-proposals-from-social-organizations.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 24 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-part-time-representatives

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-part-time-representatives.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 25 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-justice-serves-reality

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-justice-serves-reality.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 26 · B · 制度设计文章未且仅未出现一次于 /civic-orderism/：civic-orderism/why-information-transparency

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-information-transparency.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 27 · B · 制度研究延伸文章在 /civic-orderism/ 出现次数不为 1：civic-orderism/why-weaken-party-politics

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-weaken-party-politics.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 28 · B · 制度研究延伸文章在 /civic-orderism/ 出现次数不为 1：civic-orderism/why-emphasize-reciprocity-and-equality

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-emphasize-reciprocity-and-equality.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 29 · B · 制度研究延伸文章在 /civic-orderism/ 出现次数不为 1：civic-orderism/why-focus-on-invisible-power-nodes

- 文件：`content/civic-orderism/index.md`、`content/institution-design/index.md`、`content/civic-orderism/why-focus-on-invisible-power-nodes.md`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：已发布路线将完整制度档案集中至 /institution-design/，旧断言仍要求路线页复制同一文章卡片。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。逐篇检查路线的制度档案入口、目标页面存在、统一目录恰好一张对应卡片，并禁止该文章直接混入六阶段路线；缺失/重复卡片变异测试必须失败。
- 当前结果：**PASS**。

## 30 · B · 未来制度研究档案未按要求折叠组织

- 文件：`content/civic-orderism/index.md`、`data/civic-orderism.config.json`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：旧断言要求 details 内重复列出全部旧文章；现行设计为明确的完整档案入口。
- 功能影响：现行页面功能存在；旧断言误报。SEO、URL、内容：无内容/URL/SEO退化；保持原文及现行入口。
- 需要处理：是。核对标题、说明、研究提示、数量19及实际目标，统一目录的19张卡片必须完整且唯一。
- 当前结果：**PASS**。

## 31 · A · 制度设计页文章卡片包含未知制度模块

- 文件：`content/institution-design/index.md`、`data/institution-sections.config.json`；验证器：`scripts/validate-v2-architecture.mjs`。
- 遗留 / 本次引入：是 / 否。原因：真实数据错误：卡片使用失效 parliament ID，现行配置 ID 为 council，二者可见名称均为“议会与社会授权”。
- 功能影响：会导致制度模块筛选遗漏文章。SEO、URL、内容：没有丢文或改URL；原筛选遗漏影响发现性。
- 需要处理：是。修正技术 ID，名称及政治分类不变；断言所有卡片 module ID 有效、可见名称一致、核心文章归属正确。
- 当前结果：**PASS**。

## 额外发现并修复的真实问题（不混入原31条）

1. A · 制度目录缺失 `</article>`，后三张延伸卡片嵌套在信息透明卡片中；修复闭合。新契约检查禁止卡片嵌套，变异测试重现旧缺陷（所有文章链接仍存在时也必须失败）。
2. A · 旧导航已退役，但知识目录筛选/分页控制器也随之失去入口。抽出为独立非视觉 `KnowledgeBrowser`，通过 Quartz 共享 afterBody 生命周期接入；不加载旧导航、动画或搜索逻辑。原缺陷在052首页改版后存在，原31断言未覆盖运行时交互。实测六筛选、概念、重置、10+9分页、SPA离开返回及真实Safari筛选。
3. A · 已发布筹备PDF实际15页，入口写22页（22页属于入门手册）；仅更正入口页数并数据化，不修改PDF。
4. A · 制度目录四栏最小宽度在1024px超过阅读列，造成10px横向溢出；将现有两栏断点从900提高到1100，仅限该页。重跑9宽度×2主题通过。

## 新断言为何没有降低标准

- 不再要求重复失效的旧标题，但仍独立验证身份、程序、代表授权、公开报名边界与真实CTA。
- 不再要求两处复制档案，但仍逐篇校验19篇、真实目标、唯一性、模块标签和不能嵌套。
- 4个新增自动化测试同时包含真实内容检验和负向变异；去掉保护性条件、删卡、重复卡、错误模块或重新嵌套必须失败。全套测试89/89，无skip。
- 页面顺序按实际结构而非首次出现相同短语检查。没有通过调整正式文案制造通过。

## C类范围外事项

31条中没有C类留置项。仓库180份历史格式警告、日期仅有时区差异，以及SafariDriver会话问题单列在RC风险报告，不伪装为验证成功，也不通过大规模格式化或改政治文本处理。

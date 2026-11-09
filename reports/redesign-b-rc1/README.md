# Civic Orderism Website — Release Candidate 1

**标识：redesign-b-rc1**

**状态：RELEASE CANDIDATE READY — AWAITING DEPLOYMENT APPROVAL**

这是技术验收候选版，不是上线批准。未 push、未创建 PR、未 merge main、未执行 Pages / Workers 部署。现有生产站点未改动。

## 1. Git与安全基线

- 仓库：`/Users/zhaopengbo/网站/civic-orderism-official-redesign`。
- 分支：`feature/official-site-redesign-b`；本轮起点 `052aeb6b60f0012bd3677b656d3bdc5d821e90e0`，起始工作区干净。
- 已只读核对远端 main：`36fb221963f7aa84b8a0d97b051c59aa7631c23a`。原有052aeb6是独立开发提交。
- 最终准确 HEAD / 本轮 commit 记录在交付包 `RELEASE-MANIFEST.json`，并可用本地 `git rev-parse redesign-b-rc1-verified` 复核；本报告随RC提交，避免自引用哈希。
- 原 checkout `/Users/zhaopengbo/网站/civic-orderism-site` 的3,616条已有暂存状态保留；无reset/clean/破坏性checkout。
- Quartz 4.5.2 / Preact / TypeScript / SCSS保留。无新依赖、无正式域名/密钥/部署配置改动。
- `.github/workflows/deploy.yml` 仍由push main、PR main及workflow_dispatch触发；PR只构建，非PR可部署Pages。Workers配置仍以public为资产源；仓库外Cloudflare自动触发配置无法从代码核实，未推送任何分支。
- 共享本地静态预览：`http://127.0.0.1:8780`，不调用Wrangler。

## 2. 实际修复

1. 制度目录修复缺失 `</article>`，原后三张文章嵌套在前一卡片内；补齐HTML闭合，不改政治文本。
2. 失效技术模块ID `parliament` 改为现行 `council`，可见名称仍为“议会与社会授权”，不改分类含义。
3. 恢复未接入的目录筛选/分页：从退役导航脚本抽出独立 `KnowledgeBrowser`，经Quartz共享afterBody接入；不恢复旧导航、动画或搜索。
4. 制度目录在1024px有10px溢出：现有两栏断点由900提前至1100，仅作用于该页标题区。
5. 筹备PDF实际15页，入口误写22页；仅将页数配置化并更正显示，正式PDF未改。
6. 为已批准原始WebP母版追加四个AVIF分发尺寸，保留原WebP回退、原人物/背景/构图。首页picture与preload共用同一srcset/sizes，`fetchpriority=high`，首屏不懒加载。
7. 手机近期文章摘要最多2行，重点文章仍3行，标题、政治路线与正式声明不截断。
8. 本地静态预览的旧MIME数据库不认识AVIF，补齐仅本地服务器的image/avif响应头；生产Workers配置不变。
9. 将31项过期/失效v2规则更新为现行语义及真实入口契约；增加四个含负向变异的自动化测试。没有删测试或跳过断言。

完整文件清单：`CHANGED-FILES.md`。无正式文章正文、frontmatter、组织法律身份、政治承诺、导航目标、部署流程改动。

## 3. Safari验证

环境：macOS27.2 / Safari27.2。标准SafariDriver两次在创建会话阶段约30秒超时，HTTP500；status仍ready。日志和原始错误保留。没有执行--enable、修改权限、关闭SIP或改变安全配置。

替代方法为**真正的macOS Safari原生UI与原生Web Inspector**，并非Chrome或Playwright WebKit冒充。

| 页面                                      | 原生Safari明色 | 原生Safari深色 |
| ----------------------------------------- | -------------- | -------------- |
| 首页                                      | PASS           | PASS           |
| 政治路线 /civic-orderism                  | PASS           | PASS           |
| 政治经济观察 /china                       | PASS           | PASS           |
| 正式文章 /china/the-world-xi-jinping-sees | PASS           | PASS           |
| 关于赵鹏博 /about/initiator               | PASS           | PASS           |
| 理论与制度 /theory                        | PASS           | PASS           |
| 组织建设 /preparation                     | PASS           | PASS           |

- 1440×900响应式配置在Safari原生console读取1439×899（缩放舍入），逐页无内容横向溢出，宋体标题正常。
- 首页原生Safari实际选中1086 AVIF；窄屏实际590 AVIF；加载完成、高优先级、不懒加载、无图片反色。人物介绍原WebP同样正常。
- 390响应式视图：菜单展开/关闭、Esc焦点返回、Return激活、站内导航正常。320首页无溢出。
- 移动文章目录展开正常，真实链接导航到正文标题；hash、scrollY2071、目标顶部63.94px均有原生console证据。
- 实际点击“议会与社会授权”：4篇，分页状态正确；不是只检查源码。
- 原生125%页面放大可阅读；document clientWidth=scrollWidth=501。innerWidth=500是Safari小数缩放舍入，元素检查无超界。已恢复100%。
- 深色是本地站点偏好测试，没有切换macOS系统外观。原theme=null已恢复，关闭自建测试标签，原起始页保留。
- 未完成：物理iPhone/iPad；SafariDriver自动化完整矩阵；Safari原生九宽度穷举；原生OS深色偏好切换。不得将RDM称为iPhone真机。原生控制台未观察到JS错误，但没有自动化全页错误计数。

详细证据：`safari-summary.json`、交付包 `evidence/safari/`；含各页截图、原生console与驱动错误日志。

## 4. validate:v2逐条调查

**旧main40条 → 开发起点31条 → RC0条。** 本轮31项：A类真实错误1条，B类过期断言30条，C类0条。全部是旧main已有失败；另外发现并修复运行时筛选入口、嵌套卡片、页数及1024溢出。

逐项测试名称、对应文件、原因、遗留/回归判断、功能/SEO/内容影响、修复理由和最终结果见 `V2-INVESTIGATION.md` 与 `v2-investigation.json`。身份、授权、法律程序及不公开任命边界没有降低标准；负向变异去掉关键条件必须失败。

## 5. 性能与资源

相同机器Chrome156 / Lighthouse13.6.0，本地gzip静态服务器，baseline为冻结052aeb6:8783，RC:8780。正式比较在其他浏览器QA结束后按“前→后”串行交替，每种配置三次，移动模拟412×823、DPR1.75、4倍CPU/默认模拟节流；桌面preset=desktop。所有原始JSON保留，不替代真实生产CWV。

| 指标（3次中位数） | 优化前手机 | RC手机 | 优化前桌面 | RC桌面 |
| ----------------- | ---------: | -----: | ---------: | -----: |
| Performance       |         97 |     99 |        100 |    100 |
| Accessibility     |        100 |    100 |        100 |    100 |
| Best Practices    |        100 |    100 |        100 |    100 |
| SEO               |        100 |    100 |        100 |    100 |
| LCP秒             |      2.488 |  2.038 |      0.429 |  0.410 |
| CLS               |          0 |      0 |          0 |      0 |
| TBT毫秒           |         85 |     85 |          0 |      0 |

每次原始结果：

| Profile | Before score / LCP秒（1、2、3）       | RC score / LCP秒（1、2、3）           |
| ------- | ------------------------------------- | ------------------------------------- |
| mobile  | 97 / 2.492；97 / 2.488；97 / 2.488    | 99 / 2.039；99 / 2.038；99 / 2.037    |
| desktop | 100 / 0.432；100 / 0.429；100 / 0.429 | 100 / 0.411；100 / 0.410；100 / 0.410 |

实际LCP元素为 `.hero-portrait picture img`，Lighthouse确认可在首HTML发现、priority=high、非lazy。原WebP母版哈希不变，AVIF quality70由母版编码，无人像修图/重绘。脸部裁片PSNR约38.77dB，视觉比较未见明显退化。AVIF不支持时跳过type preload，picture回退原WebP；本地隔离picture回退实验成功。5个宽度/DPR组合均只下载一张人像，没有preload与picture双下载。

- 手机590：82,276 → 47,451 B（约-42.3%）；400：34,818 → 22,801 B。
- 桌面1086：103,856 → 53,535 B（约-48.5%）；768：46,016 → 28,057 B。
- CSS：305,908 → 305,975 B；gzip46,708 → 46,715 B。
- postscript：83,837 → 86,013 B；gzip27,961 → 28,574 B，增量为恢复的目录筛选逻辑。
- prescript：923 B / gzip384 B，不变。无新运行时依赖/网络字体/动画库。人物首屏高优先级，非首屏图按现有lazy策略。
- 现有CDN数学样式预连接仍在；没有为抠分扩大到全站资源架构重构。
- 所有探索记录也保留。其中一次与其他浏览器QA重叠的初步RC手机测量出现Performance78 / LCP5.86秒；未删除，也未混入无并发的正式配对组。分数波动、实验室与真机网络差异仍须上线授权后的实际观测。

## 6. 内容、URL、SEO与法律状态

- Markdown：159 → 159，无新增或删除。正式文章：105 → 105，**105份完整源文件与旧main及052aeb6均逐字节一致**，包含frontmatter、日期、作者、分类、图片引用、正文和正式政治纲领。
- RC仅两个Markdown技术修改：制度目录闭合/模块ID、筹备PDF页数。人物说明正文与组织声明未改。
- HTML：499 → 499，无路径增加/丢失；生产全部499个原路径实际HTTP200，开发内链22,488条通过。16个既有meta-refresh别名目标存在，无循环。原有同canonical的index/别名文件组保持，不创造新路径。
- 既有页面canonical、标题、description、OG/Twitter及JSON-LD在相同本地构建环境与main一致；正式站页头均有绝对HTTPS图片URL且本地资源存在，JSON-LD语法有效。
- Sitemap143个唯一loc保持；RSS/sitemap与相同环境main构建字节一致，robots与生产字节一致。
- **不能声称生产所有SEO字节完全一致**：121个生产页面JSON-LD、sitemap139个lastmod及RSS7个pubDate与本地差异均仅是日历日期相同的00:00Z/04:00Z。根因是既有 `lastmod.ts` 把YYYY-MM-DD当本地午夜、CI与Toronto时区不同；相同源码旧main已复现。未改正式日期或部署流程，单列长期维护债务。
- 另有两份既有原始PDF排版HTML `/files/civic-orderism-introduction-manual-source.html` 与 `/static/files/...` 没有canonical/social metadata；不是Quartz正式文章页，本轮未改。应在后续独立维护任务决定noindex或隔离策略，不修改冻结正式文档源文件。
- 法律状态依据：`data/organization.config.json` 明确preparing/not_registered/undetermined，筹备页#boundaries、董事会页、about、正式筹备声明和PDF第2页一致为未注册、未产生首届董事会；没有将“筹备”改成“已经完成”。PDF实际15页；入门手册22页，两份源/输出哈希一致并未改动。
- 这是公开来源之间的一致性核对，并非独立确认真实登记结果。若现实注册/申请状态后来改变，须由本人提供新事实后单独审核；本轮无须凭空补写法律身份。

明细：`source-integrity.json`、`seo-summary.json`、`additional-seo.json`；完整499页生产抓取在交付证据目录，仅只读访问。

## 7. 完整回归与设计审查

| 检查                                                                        | 结果                                                        |
| --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| TypeScript `tsc --noEmit`                                                   | PASS                                                        |
| Quartz `npm run build`及markup / CTA / favicon / commitments / architecture | PASS                                                        |
| 自动化 `npm test`                                                           | 89/89 PASS，0 skip                                          |
| validate:v2                                                                 | PASS，0剩余失败                                             |
| article typography                                                          | 105源及105页面 PASS                                         |
| content safety                                                              | PASS，另全105源哈希一致                                     |
| 内链                                                                        | 22,488 / 499 PASS                                           |
| 9宽度×2主题×8页面                                                           | 144视图 PASS，0横向溢出/破图/console errors，最大CLS0       |
| axe WCAG2A/AA、2.1AA及best-practice                                         | 32组合（390/1440×2主题×8页）0违规                           |
| 键盘/跳至正文/菜单/目录                                                     | Chrome实测通过；Safari实测见上                              |
| `npm run check`整体                                                         | **非绿：180份既有Prettier警告；TypeScript通过，非功能失败** |
| diff whitespace                                                             | PASS                                                        |

使用官方web-design-guidelines审查：标题/landmark语义、alt、focus-visible、菜单ARIA、原生按钮/链接、摘要限制不截标题、44/48px主要触控控件、字体回退、深色对比与图片无反色、响应式图片尺寸、无额外动效。恢复的筛选状态增加polite live region。无新未解决的阻断设计问题。

宽度：320/360/375/390/430/768/1024/1440/1920。页面：首页、路线、观察、正式文章、人物、理论、组织，额外制度目录。代码块在没有代码示例的文章中不作虚构测试对象；现有样式未改。静态axe不能代替全部屏幕阅读器及物理触控人工测试。

PR#32 `homeScrollRestorationScript` 与main字节一致，SHA256 `9ddede729fbfd707ac95f8706bf371562aae87ae15297958892966f71736c9bc`。整个renderPage.tsx与052aeb6一致；先前改版已有的搜索索引load时机调整保持原状，没有在RC再动scroll或SPA。

## 8. 风险及审批边界

### 阻止上线

当前没有已复现且未修复的功能、内容丢失、URL、构建或响应式阻断项。**仍需人工部署批准；RC ready不等于获准上线。**

### 建议上线前人工确认

- 真实iPhone/iPad视觉、触控与移动Safari照片加载；本轮原生macOS Safari已实测，但RDM不是真机。
- 复核本报告截图与批准设计一致；确认组织公开事实没有出现新变化。
- 未来获授权预发布/上线时验证CDN压缩、真实LCP、OG实际返回；本轮仅本地实验室测量，没有部署。

### 可上线后独立处理

- SafariDriver实例创建超时；本轮以真实SafariUI补足主要兼容性证据，不降低系统安全配置。
- 180份历史格式债务；本轮未新增格式警告文件，不通过批量改正式文章修复。
- 已存在的日期时区非确定性，以及两份PDF排版源HTML的SEO隔离；无本次改版引入的索引退化。
- 进一步数学样式等资源按页加载优化，须独立任务，不能以分数为由改变已批准设计。

## 本地预览与交付

```sh
cd /Users/zhaopengbo/网站/civic-orderism-official-redesign
npm ci
npm run build
npm run preview:local
```

不要运行deploy，不要push本分支。交付ZIP包含已构建site、源码snapshot、报告、截图、性能原始证据与manifest；保留上轮052aeb6交付包。预览须HTTP服务，不能把双击file://行为当服务器运行结果。

截图：`evidence/home-1440-light-full.png`、`home-390-light-full.png`、`home-320-light-full.png`、`home-1440-dark-full.png`、`article-1440-light-full.png`；Safari在 `evidence/safari/final-*.png`。

**RELEASE CANDIDATE READY — AWAITING DEPLOYMENT APPROVAL**

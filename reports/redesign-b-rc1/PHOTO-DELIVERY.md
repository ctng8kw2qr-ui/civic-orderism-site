# 人像分发资源

原照片02及已批准B方案摄影内容不变。本轮未抠图、未改脸、未换背景。全部既有WebP母版与052aeb6的SHA-256相同；完整哈希/文件大小在source-integrity.json。

仅由已批准母版追加AVIF分发文件（sharp既有依赖，quality70、effort6）：

```js
import sharp from "sharp";
const base = "quartz/static/assets/v6/people/zhao-pengbo-b";
for (const [kind, widths] of [
  ["desktop", [768, 1086]],
  ["portrait", [400, 590]],
]) {
  for (const width of widths) {
    await sharp(`${base}-${kind}.webp`)
      .resize({ width })
      .avif({ quality: 70, effort: 6 })
      .toFile(`${base}-${kind}-${width}.avif`);
  }
}
```

这是复现说明，非构建阶段每次重编码；正式构建直接拷贝已审查静态资源。已有WebP仍是浏览器回退。首页picture与preload共用homepagePortrait配置，mobile/desktop媒体条件互斥；AVIF不支持时不下载AVIF preload，浏览器选择原WebP。

浏览器实测320×1、390×2、768×1、1024×1、1440×2每次只下载一张人物图，高优先级、不懒加载。原生Safari实测加载AVIF且filter=none；Chrome隔离picture测试WebP回退。

脸部220×230裁片编码对照PSNR约38.77dB；对照图在交付evidence/performance/portrait-encoding-comparison.png。压缩有损但没有AI重绘或身份编辑，也未对每次压缩后的图继续加工。

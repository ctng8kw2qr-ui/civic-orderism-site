import sharp from "sharp";
import { fileURLToPath } from "node:url";

// Offline export, following the existing Sharp asset pipeline. The generated
// 5:2 PNG is retained as the source; web/social are centered crop variants.
const master = new URL(
  "../quartz/static/assets/v6/editorial/source/editorial-bureaucratic-responsibility-cycle.png",
  import.meta.url,
);
const input = await sharp(fileURLToPath(master))
  .resize(2000, 800, { fit: "cover", position: "centre" })
  .png()
  .toBuffer();
await sharp(input).toFile(fileURLToPath(master));
for (const [path, width, height] of [
  ["editorial/editorial-bureaucratic-responsibility-cycle.webp", 1600, 842],
  ["social/social-bureaucratic-responsibility-cycle.webp", 1200, 630],
]) {
  const output = fileURLToPath(
    new URL(`../quartz/static/assets/v6/${path}`, import.meta.url),
  );
  const result = await sharp(input)
    .resize(width, height, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toFile(output);
  console.log(path, result.width, result.height, result.size);
}

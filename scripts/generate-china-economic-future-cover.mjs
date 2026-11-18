import sharp from "sharp";
import { fileURLToPath } from "node:url";

// Editorial cover export for 《中国经济的未来在哪里？》.
// The editable SVG master lives in editorial/source/; this script renders the
// canonical 1.9:1 web cover and the social-compatible variant, following the
// existing Sharp asset pipeline (see generate-responsibility-cycle-cover.mjs).
const master = fileURLToPath(
  new URL(
    "../quartz/static/assets/v6/editorial/source/editorial-china-economic-future.svg",
    import.meta.url,
  ),
);
for (const [path, width, height] of [
  ["editorial/editorial-china-economic-future.webp", 1600, 842],
  ["social/social-china-economic-future.webp", 1200, 630],
]) {
  const output = fileURLToPath(
    new URL(`../quartz/static/assets/v6/${path}`, import.meta.url),
  );
  const result = await sharp(master)
    .resize(width, height, { fit: "fill" })
    .webp({ quality: 82 })
    .toFile(output);
  console.log(path, result.width, result.height, result.size);
}

import sharp from "sharp";
import { fileURLToPath } from "node:url";

// Offline export using the existing dependency; never part of site build.
// The SVG uses the site's system CJK font stack. Review after any re-export.
const source = new URL(
  "../quartz/static/assets/v6/social/civic-orderism-home-social-v1.svg",
  import.meta.url,
);
const destination = new URL(
  "../quartz/static/assets/v6/social/civic-orderism-home-social-v1.webp",
  import.meta.url,
);
await sharp(fileURLToPath(source))
  .webp({ quality: 92 })
  .toFile(fileURLToPath(destination));
console.log(await sharp(fileURLToPath(destination)).metadata());

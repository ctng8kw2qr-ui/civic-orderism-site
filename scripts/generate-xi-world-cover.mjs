import sharp from "sharp";
import { fileURLToPath } from "node:url";

// Preserve the built-in imagegen PNG source. One canonical web cover is shared
// by the article, homepage research list and OG/Twitter metadata.
const source = fileURLToPath(
  new URL(
    "../quartz/static/assets/v6/editorial/source/editorial-xi-filtered-reality.png",
    import.meta.url,
  ),
);
const destination = fileURLToPath(
  new URL(
    "../quartz/static/assets/v6/editorial/editorial-xi-filtered-reality.webp",
    import.meta.url,
  ),
);
const info = await sharp(source)
  .resize(1600, 842, { fit: "cover", position: "centre" })
  .webp({ quality: 82 })
  .toFile(destination);
console.log(info);

import fs from "node:fs"
import path from "node:path"

const outputDir = path.resolve("public")

if (!fs.existsSync(outputDir)) {
  throw new Error("public directory does not exist. Run the Quartz build before generating static security files.")
}

const files = {
  "robots.txt": `User-agent: *
Allow: /

Sitemap: https://civicorderism.com/sitemap.xml
`,
  _headers: `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  X-Frame-Options: DENY
`,
}

for (const [filename, body] of Object.entries(files)) {
  fs.writeFileSync(path.join(outputDir, filename), body, "utf8")
}

console.log("Generated static security files.")

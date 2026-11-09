import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { gzipSync } from "node:zlib";
import handler from "serve-handler";

const publicDir = path.resolve("public");
if (!fs.existsSync(path.join(publicDir, "index.html")))
  throw new Error("Run npm run build first.");
const port = Number(process.env.CO_PREVIEW_PORT ?? 8780);
const textTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
};
// Local-only static preview. Compress text for representative transfer-size QA;
// serve-handler retains clean URLs and binary/file handling. No Workers invoked.
http
  .createServer((req, res) => {
    if (
      ["GET", "HEAD"].includes(req.method) &&
      /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")
    ) {
      try {
        const pathname = decodeURIComponent(
          new URL(req.url, "http://localhost").pathname,
        );
        const target = path.resolve(publicDir, `.${pathname}`);
        if (
          target === publicDir ||
          target.startsWith(`${publicDir}${path.sep}`)
        ) {
          const candidates = [
            path.join(target, "index.html"),
            target,
            `${target}.html`,
          ];
          const file = candidates.find(
            (f) =>
              textTypes[path.extname(f)] &&
              fs.existsSync(f) &&
              fs.statSync(f).isFile(),
          );
          if (file) {
            const body = gzipSync(fs.readFileSync(file));
            res.writeHead(200, {
              "Content-Type": textTypes[path.extname(file)],
              "Content-Encoding": "gzip",
              "Content-Length": body.length,
              Vary: "Accept-Encoding",
            });
            res.end(req.method === "HEAD" ? undefined : body);
            return;
          }
        }
      } catch {
        /* Fall through to normal static error handling. */
      }
    }
    return handler(req, res, {
      public: publicDir,
      cleanUrls: true,
      // This legacy server's MIME database predates AVIF; production uses Workers assets.
      headers: [
        {
          source: "**/*.avif",
          headers: [{ key: "Content-Type", value: "image/avif" }],
        },
      ],
    });
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Local-only preview: http://127.0.0.1:${port}`),
  );

import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"
import { glob } from "../../util/glob"
import { dirname, basename } from "path"

export const RootStatic: QuartzEmitterPlugin = () => ({
  name: "RootStatic",
  async *emit({ argv, cfg }) {
    const staticPath = joinSegments(QUARTZ, "static")
    const rootStaticFiles = [
      "favicon.ico",
      "favicon-16x16.png", 
      "favicon-32x32.png",
      "apple-touch-icon.png",
      "icon-192.png",
      "icon-512.png",
      "og-image.png",
      "site.webmanifest"
    ]

    const outputRootPath = argv.output
    const allFiles = await glob("**", staticPath, cfg.configuration.ignorePatterns)
    
    const copiedFiles: FilePath[] = []
    for (const fp of allFiles) {
      const fileName = basename(fp)
      const isPublicFile = fp.startsWith("files/")
      if (rootStaticFiles.includes(fileName) || isPublicFile) {
        const src = joinSegments(staticPath, fp) as FilePath
        const dest = joinSegments(outputRootPath, isPublicFile ? fp : fileName) as FilePath
        await fs.promises.mkdir(dirname(dest), { recursive: true })
        await fs.promises.copyFile(src, dest)
        copiedFiles.push(dest)
        yield dest
      }
    }
  },
  async *partialEmit() {},
})

import { FullSlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

export const Robots: QuartzEmitterPlugin = () => ({
  name: "Robots",
  async *emit(ctx) {
    const baseUrl = ctx.cfg.configuration.baseUrl ?? "example.com"
    const content = `User-agent: *
Allow: /

Sitemap: https://${baseUrl}/sitemap.xml
`

    yield write({
      ctx,
      content,
      slug: "robots" as FullSlug,
      ext: ".txt",
    })
  },
})

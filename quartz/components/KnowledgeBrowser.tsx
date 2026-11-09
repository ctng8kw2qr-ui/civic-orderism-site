import { QuartzComponent, QuartzComponentConstructor } from "./types";
// @ts-ignore — bundled as a shared after-DOM-ready resource by Quartz.
import script from "./scripts/knowledgeBrowser.inline";

/** Non-visual, shared archive-filter lifecycle; independent of the site header. */
const KnowledgeBrowser: QuartzComponent = () => null;
KnowledgeBrowser.afterDOMLoaded = script;
export default (() => KnowledgeBrowser) satisfies QuartzComponentConstructor;

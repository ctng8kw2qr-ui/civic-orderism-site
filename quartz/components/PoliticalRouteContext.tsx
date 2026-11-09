import { QuartzComponent, QuartzComponentConstructor } from "./types";

/** Approved route identity; the existing full political text remains untouched. */
const PoliticalRouteContext: QuartzComponent = ({ fileData }) => {
  if ((fileData.slug ?? "").replace(/\/index$/, "") !== "civic-orderism")
    return null;
  return (
    <div class="route-context" role="region" aria-label="政治路线核心原则">
      经济赎买 <span aria-hidden="true">·</span> 不革命{" "}
      <span aria-hidden="true">·</span> 不清算
    </div>
  );
};
PoliticalRouteContext.css = `.route-context{box-sizing:border-box;max-width:var(--v6-container);margin:0 auto;padding:28px var(--v6-gutter) 0;color:var(--v6-brand-text);font:500 18px/1.8 var(--v6-font-sans);}`;
export default (() =>
  PoliticalRouteContext) satisfies QuartzComponentConstructor;

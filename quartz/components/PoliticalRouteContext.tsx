import { QuartzComponent, QuartzComponentConstructor } from "./types";

/** Approved route identity; the existing full political text remains untouched. */
const PoliticalRouteContext: QuartzComponent = ({ fileData }) => {
  if ((fileData.slug ?? "").replace(/\/index$/, "") !== "civic-orderism")
    return null;
  return (
    <div class="route-context" role="region" aria-label="政治路线四个层次">
      <span>
        <strong>政治目标：</strong>和平政治转轨
      </span>
      <span>
        <strong>核心机制：</strong>经济赎买
      </span>
      <span>
        <strong>基本原则：</strong>不革命、不清算
      </span>
      <span>
        <strong>根本底线：</strong>国家连续运行
      </span>
    </div>
  );
};
PoliticalRouteContext.css = `.route-context{box-sizing:border-box;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 32px;max-width:var(--v6-container);margin:0 auto;padding:28px var(--v6-gutter) 0;color:var(--v6-brand-text);font:500 16px/1.7 var(--v6-font-sans);}.route-context span{display:flex;gap:4px;align-items:baseline;min-width:0;}.route-context strong{flex:none;font-weight:500;color:var(--v6-text-secondary);}@media(max-width:700px){.route-context{grid-template-columns:1fr;gap:2px;padding-top:20px;font-size:14px;}}`;
export default (() =>
  PoliticalRouteContext) satisfies QuartzComponentConstructor;

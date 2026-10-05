import fs from "node:fs";
import path from "node:path";

/**
 * Guard: the generic internal-link reset must not erase a button's own
 * background.
 *
 * `article a.internal` exists to strip Quartz's inline-link "pill" from
 * block-level index rows and cards. It sets `background: none`, which is right
 * for those rows but wrong for anchors that opt into a button component. The two
 * have identical (0,1,2) specificity, so before this rule was scoped the outcome
 * depended only on which block happened to be written later in the stylesheet.
 * The visible symptom was a primary CTA rendering as an empty bordered box:
 * white text on a transparent ground.
 *
 * The check is deliberately static and narrow. It does not attempt a general
 * contrast audit of every link — that belongs in the render-time scan used
 * during review, and a computed-style validator would need a browser in CI.
 * Instead it answers one question a future edit could otherwise silently break:
 *
 *     for every anchor that is BOTH `.internal` and a brand-filled component,
 *     is that component excluded from the internal-link reset?
 *
 * Both sides are derived from the repository, so adding a new filled button
 * component without excluding it fails here rather than in production.
 */

const root = path.resolve(".");
const stylesheet = path.join(root, "quartz", "styles", "custom.scss");
const publicDir = path.join(root, "public");

/** Strip a BEM state suffix: `v2-button--primary` -> `v2-button`. */
function baseClass(className) {
  const index = className.indexOf("--");
  return index === -1 ? className : className.slice(0, index);
}

if (!fs.existsSync(stylesheet)) {
  console.error(
    `Primary CTA visibility check: stylesheet not found (${stylesheet})`,
  );
  process.exitCode = 1;
} else {
  const css = fs.readFileSync(stylesheet, "utf8");
  const errors = [];

  /* 1. The reset rule and the classes it already excludes. */
  const resetSelector = css.match(/^article a\.internal((?::not\(\.[\w-]+\))*)/m);
  if (!resetSelector) {
    errors.push(
      "找不到 `article a.internal` 重置规则：internal-link reset 可能已被重命名或删除。",
    );
  }
  const excluded = new Set(
    [...(resetSelector?.[1] ?? "").matchAll(/:not\(\.([\w-]+)\)/g)].map(
      (match) => match[1],
    ),
  );

  /* 2. Every class that paints a brand background, derived from the stylesheet
        so a new filled component is covered without editing this file. */
  const filledClasses = new Set();
  const rulePattern = /^([^\n{}/][^\n{}]*?)\{([^}]*)\}/gm;
  let rule;
  while ((rule = rulePattern.exec(css)) !== null) {
    const paintsBrandBackground =
      /background(?:-color)?\s*:\s*(?:var\(--btn-primary-bg\)|var\(--v6-brand\)|#[0-9a-fA-F]{3,8})/.test(
        rule[2],
      );
    if (!paintsBrandBackground) continue;
    for (const match of rule[1].matchAll(/\.([\w-]+)/g)) {
      filledClasses.add(match[1]);
    }
  }

  /** Does this class, or its BEM base, paint a brand background? */
  const isFilled = (className) =>
    filledClasses.has(className) || filledClasses.has(baseClass(className));

  /** Would the reset exclude an element carrying this class? */
  const isExcluded = (className) => {
    const base = baseClass(className);
    /*
     * A base-class exclusion covers every state of that component, so
     * `:not(.v2-button)` also protects `v2-button--primary`.
     */
    for (const entry of excluded) {
      if (className === entry || base === entry) return true;
    }
    return false;
  };

  /* 3. The defect surface in the built output: anchors that are both. */
  if (fs.existsSync(publicDir)) {
    const walk = (dir) =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
      });

    const offenders = new Map();
    for (const file of walk(publicDir)) {
      const html = fs.readFileSync(file, "utf8");
      for (const tag of html.matchAll(/<a\b[^>]*class="([^"]*)"/g)) {
        const classes = tag[1].split(/\s+/).filter(Boolean);
        if (!classes.includes("internal")) continue;
        /*
         * An element is protected when ANY class it carries is excluded.
         * Components do not all use one naming shape — `v2-button--primary` is
         * a BEM state (`v2-button--…`) while `resource-button-primary` is a
         * separate single-hyphen class — so ask about the whole class list
         * rather than trying to derive a base name from one member of it.
         */
        const filledOnElement = classes.filter(isFilled);
        if (filledOnElement.length === 0) continue;
        if (classes.some(isExcluded)) continue;
        for (const className of filledOnElement) {
          offenders.set(className, { file: path.relative(root, file) });
        }
      }
    }
    for (const [className, info] of offenders) {
      errors.push(
        `${info.file} 上的 \`<a class="… ${className} … internal">\` 未被 internal-link reset 排除：` +
          `该按钮会失去品牌底色，变成透明底 + 白字（视觉上不可见）。` +
          `请在 \`article a.internal\` 上加入 \`:not(.${baseClass(className)})\`。`,
      );
    }
  }

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Primary CTA visibility check passed: internal-link reset excludes ${[...excluded]
        .map((c) => `.${c}`)
        .join(", ")}; ${filledClasses.size} brand-filled class(es) derived from the stylesheet, 0 unprotected anchors.`,
    );
  }
}

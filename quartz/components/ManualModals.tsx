// @ts-ignore
import script from "./scripts/manualModals.inline";
import style from "./styles/manualModals.scss";
import { QuartzComponent, QuartzComponentConstructor } from "./types";

const ManualModals: QuartzComponent = () => {
  return (
    <div class="manual-modal-layer">
      <dialog
        class="manual-modal"
        data-manual-dialog="introduction"
        aria-labelledby="introduction-modal-title"
      >
        <div class="manual-modal-panel">
          <button
            class="manual-modal-close-icon"
            type="button"
            data-manual-close
            aria-label="关闭"
          >
            ×
          </button>
          <p class="manual-modal-label">入门手册</p>
          <h2 id="introduction-modal-title">公民秩序主义介绍手册</h2>
          <p class="manual-modal-subtitle">信息化时代的国家秩序方案</p>
          <p class="manual-modal-description">
            这份手册用于简要说明公民秩序主义的基本理念、核心政治路线与治理判断。它适合第一次接触公民秩序主义的人阅读，也可作为对外传播和公共讨论的入门材料。
          </p>
          <div class="manual-modal-actions">
            <a
              class="manual-modal-button manual-modal-button-primary"
              href="/files/civic-orderism-introduction-manual.pdf"
            >
              下载 PDF
            </a>
            <a class="manual-modal-button" href="/introduction-manual">
              阅读 HTML 版
            </a>
          </div>
          <button
            class="manual-modal-close-text"
            type="button"
            data-manual-close
          >
            关闭
          </button>
        </div>
      </dialog>

      <dialog
        class="manual-modal"
        data-manual-dialog="organization"
        aria-labelledby="organization-modal-title"
      >
        <div class="manual-modal-panel">
          <button
            class="manual-modal-close-icon"
            type="button"
            data-manual-close
            aria-label="关闭"
          >
            ×
          </button>
          <p class="manual-modal-label">正式资料</p>
          <h2 id="organization-modal-title">公民秩序主义组织手册</h2>
          <p class="manual-modal-subtitle">
            了解公民秩序主义的组织原则、协作边界、长期参与方式与治理要求
          </p>
          <p class="manual-modal-description">
            这份手册面向已经了解基本路线、希望进一步理解组织原则与协作边界的读者。第一次访问本站，建议先从“5分钟了解”和阅读地图开始。
          </p>
          <div class="manual-modal-actions">
            <a
              class="manual-modal-button manual-modal-button-primary"
              href="/files/civic-orderism-organization-manual.pdf"
            >
              下载 PDF
            </a>
            <a
              class="manual-modal-button"
              href="/files/civic-orderism-organization-manual.html"
            >
              阅读 HTML 版
            </a>
          </div>
          <button
            class="manual-modal-close-text"
            type="button"
            data-manual-close
          >
            关闭
          </button>
        </div>
      </dialog>
    </div>
  );
};

ManualModals.afterDOMLoaded = script;
ManualModals.css = style;

export default (() => ManualModals) satisfies QuartzComponentConstructor;

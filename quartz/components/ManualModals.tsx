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
    </div>
  );
};

ManualModals.afterDOMLoaded = script;
ManualModals.css = style;

export default (() => ManualModals) satisfies QuartzComponentConstructor;

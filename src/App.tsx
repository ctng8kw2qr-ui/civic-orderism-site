import {
  ArrowRight,
  Download,
  FileText,
  Landmark,
  Mail,
  Menu,
} from "lucide-react";
import { VueIsland } from "./components/VueIsland";

const navItems = ["首页", "理论文章", "制度设计", "案例分析", "文档下载", "关于我们"];

const articles = [
  {
    number: "01",
    title: "离刚性体制的终局",
    summary: "当系统失去纠错能力，秩序会从内部缓慢崩塌。",
  },
  {
    number: "02",
    title: "工业时代的政党政治在信息化时代的失效方式",
    summary: "信息化使组织的复杂度展开，传统政党结构不再适配。",
  },
  {
    number: "03",
    title: "为什么政党政治越来越像低维函数",
    summary: "结构简化导致表达迟钝，社会理解能力整体下降。",
  },
  {
    number: "04",
    title: "中共的真正死局",
    summary: "不是反对力量的打败，而是系统逻辑的自我耗尽。",
  },
  {
    number: "05",
    title: "现代社会候群症",
    summary: "高压、内卷与不确定性催生的新型集体心理结构。",
  },
];

const systemItems = [
  "公民秩序主义白皮书",
  "区级公民委员会结构",
  "双轨结构设计",
  "新闻发布与监督机制",
  "AI反腐机制设计",
];

const caseItems = [
  "魏凤和、李尚福事件分析",
  "中宣系统的空心化问题",
  "“躺平”话术的社会功能分析",
  "宣传体系的沙化与形式化",
  "社保、医保与金融体系的结构性风险",
];

const documents = [
  ["公民秩序主义白皮书", "1.2MB"],
  ["制度设计总纲", "1.1MB"],
  ["委员会架构图", "0.8MB"],
  ["新闻发布机制建议", "0.6MB"],
  ["AI反腐机制方案", "1.3MB"],
];

function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="公民秩序主义首页">
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>公民秩序主义</strong>
            <small>CIVIC ORDERISM</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="主导航">
          {navItems.map((item, index) => (
            <a className={index === 0 ? "is-active" : undefined} href={`#${index === 0 ? "home" : item}`} key={item}>
              {item}
            </a>
          ))}
        </nav>

        <button className="icon-button" aria-label="打开导航">
          <Menu size={21} />
        </button>
      </header>

      <main id="home">
        <section className="hero-section">
          <div className="hero-copy">
            <h1>构建可持续的秩序，而不是争夺短期的权力。</h1>
            <span className="title-rule" />
            <p>
              公民秩序主义是一套面向信息化时代的秩序框架，关注责任、监督、流程与公民参与的结构性重建。
            </p>
            <a className="text-link" href="#理论文章">
              了解公民秩序主义 <ArrowRight size={16} />
            </a>
          </div>

          <figure className="hero-visual" aria-label="公共建筑与制度空间">
            <img
              src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85"
              alt="灰度现代公共建筑的台阶、墙面与光影"
            />
          </figure>
        </section>

        <section className="principles-section" aria-labelledby="principles-title">
          <div className="section-heading">
            <p>Framework</p>
            <h2 id="principles-title">责任 / 监督 / 流程 / 参与</h2>
          </div>
          <VueIsland />
        </section>

        <section id="理论文章" className="content-section">
          <div className="section-bar">
            <h2>核心理论文章</h2>
            <a href="#关于我们">
              查看全部 <ArrowRight size={15} />
            </a>
          </div>
          <div className="article-grid">
            {articles.map((article) => (
              <article className="article-card" key={article.number}>
                <span>{article.number}</span>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <a href="#关于我们">
                  阅读文章 <ArrowRight size={14} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="resource-grid">
          <ResourceColumn title="制度设计" items={systemItems} icon="file" />
          <ResourceColumn title="案例分析" items={caseItems} icon="landmark" />
          <div id="文档下载" className="resource-column">
            <div className="column-head">
              <h2>文档下载</h2>
              <a href="#关于我们">
                查看全部 <ArrowRight size={15} />
              </a>
            </div>
            <div className="download-list">
              {documents.map(([title, size]) => (
                <a className="download-row" href="#关于我们" key={title}>
                  <span>PDF</span>
                  <div>
                    <strong>{title}</strong>
                    <small>PDF · {size}</small>
                  </div>
                  <Download size={17} />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="关于我们" className="statement-section">
          <blockquote>
            秩序不是服从，秩序是责任可以被追问、权力可以被监督、流程可以被复核。
          </blockquote>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <h2>关于公民秩序主义</h2>
          <p>我们相信，一个更好的社会，需要更好的制度设计，也需要每一个公民的参与。</p>
          <a href="https://civicorderism.com">了解更多 <ArrowRight size={14} /></a>
        </div>
        <div>
          <h2>快速导航</h2>
          {navItems.slice(1).map((item) => (
            <a href={`#${item}`} key={item}>{item}</a>
          ))}
        </div>
        <div>
          <h2>联系与关注</h2>
          <p>X（Twitter）：@whyyoutouzhele</p>
          <a href="mailto:contact@civicorderism.com">
            <Mail size={14} /> contact@civicorderism.com
          </a>
          <span className="x-mark">X</span>
        </div>
      </footer>

      <div className="legal-row">
        <span>© 2026 公民秩序主义 Civic Orderism. All rights reserved.</span>
        <span>
          <a href="https://civicorderism.com/privacy">隐私政策</a>
          <a href="https://civicorderism.com/terms">使用条款</a>
        </span>
      </div>
    </div>
  );
}

type ResourceColumnProps = {
  title: string;
  items: string[];
  icon: "file" | "landmark";
};

function ResourceColumn({ title, items, icon }: ResourceColumnProps) {
  const Icon = icon === "file" ? FileText : Landmark;

  return (
    <div id={title} className="resource-column">
      <div className="column-head">
        <h2>{title}</h2>
        <a href="#关于我们">
          查看全部 <ArrowRight size={15} />
        </a>
      </div>
      <div className="resource-list">
        {items.map((item) => (
          <a href="#关于我们" className="resource-row" key={item}>
            <Icon size={28} strokeWidth={1.35} />
            <span>
              <strong>{item}</strong>
              <small>结构说明、运行边界与制度接口。</small>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export { App };

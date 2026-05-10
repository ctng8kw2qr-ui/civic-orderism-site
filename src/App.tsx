const articles = [
  {
    title: "公民秩序主义理论总纲",
    href: "/articles/civic-orderism-outline.html",
  },
  {
    title: "为什么政党政治越来越像低维函数",
    href: "#",
  },
  {
    title: "中共崩解的真正压力来自制度高刚性",
    href: "#",
  },
];

function App() {
  return (
    <main className="page">
      <header className="header">
        <a className="brand" href="/" aria-label="公民秩序主义首页">
          <img src="/logo-civic-orderism.png" alt="公民秩序主义 Logo" />
        </a>
        <nav aria-label="主导航">
          <a href="#articles">文章</a>
          <a href="#note">说明</a>
          <a href="mailto:civicorderism@gmail.com">联系</a>
        </nav>
      </header>

      <section className="hero">
        <div className="eyebrow">
          PUBLIC ORDER · CIVIC DIGNITY · INSTITUTIONAL RESTRAINT
        </div>
        <h1>
          不是情绪，
          <br />
          而是秩序。
        </h1>
        <p>
          公民秩序主义是一套面向信息化时代的公共治理框架。它不追求煽动，不依赖口号，而试图以冷静、审慎、克制的方式，重建公共权威、责任链条与制度信任。
        </p>
      </section>

      <section id="articles" className="articles">
        <h2>ARTICLES</h2>
        <div className="article-list">
          {articles.map((article, index) => (
            <a href={article.href} key={article.title}>
              <span>{article.title}</span>
              <em>{String(index + 1).padStart(2, "0")}</em>
            </a>
          ))}
        </div>
      </section>

      <section id="note" className="note">
        <h2>NOTE</h2>
        <p>
          本站只用于发布文章与整理思想。现阶段不建群、不募款、不制造情绪动员。所有观点以文本形式公开，接受现实检验。
        </p>
        <p className="contact">
          联系方式：
          <a href="mailto:civicorderism@gmail.com">civicorderism@gmail.com</a>
        </p>
      </section>

      <footer>© 2026 Civic Orderism. A restrained framework for public order.</footer>
    </main>
  );
}

export { App };

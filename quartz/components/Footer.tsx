import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/v6Footer.scss";

interface NavLink {
  label: string;
  href: string;
}

interface Options {
  brand?: string;
  nameZh?: string;
  tagline?: string;
  /** 机构状态说明（一行），例如「北美非营利法人及首届董事会筹备中」。 */
  status?: string;
  /** 机构状态的细目，用于说明「筹备中」到底指什么。 */
  statusDetails?: string[];
  navLinks?: NavLink[];
  secondaryNavLinks?: NavLink[];
  contact?: {
    email?: string;
    emailLabel?: string;
    secondaryEmail?: string;
    secondaryEmailLabel?: string;
    x?: string;
    xLabel?: string;
    youtube?: string;
    youtubeLabel?: string;
  };
  copyright?: string;
  legalNote?: string;
}

/**
 * V6 — Institutional Editorial · Footer
 *
 * 页脚是机构身份的一部分，不是链接集合。
 * 四栏机构式布局：身份 / 站点导航 / 联系方式 / 官方平台。
 * 移动端自然堆叠为单列。不使用卡片、图标或色块。
 */
export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const navLinks = opts?.navLinks ?? [];
    const secondaryNavLinks = opts?.secondaryNavLinks ?? [];
    const contact = opts?.contact;
    const statusDetails = opts?.statusDetails ?? [];
    return (
      <footer class={`v6-footer ${displayClass ?? ""}`}>
        <div class="v6-footer__inner">
          <div class="v6-footer__grid">
            {/* 栏目 01 — 机构身份 */}
            <div class="v6-footer__identity">
              <p class="v6-footer__brand" lang="en">
                {opts?.brand}
              </p>
              <p class="v6-footer__name">{opts?.nameZh}</p>
              {opts?.tagline ? (
                <p class="v6-footer__tagline">{opts.tagline}</p>
              ) : null}
              {opts?.status ? (
                <p class="v6-footer__status">
                  <span class="v6-footer__status-dot" aria-hidden="true" />
                  {opts.status}
                </p>
              ) : null}
              {statusDetails.length > 0 ? (
                <ul class="v6-footer__status-list">
                  {statusDetails.map((detail) => (
                    <li>{detail}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* 栏目 02 — 站点导航 */}
            {navLinks.length > 0 ? (
              <nav class="v6-footer__col" aria-label="页脚主要导航">
                <p class="v6-footer__col-head">
                  SITEMAP <span>站点导航</span>
                </p>
                <ul class="v6-footer__list">
                  {navLinks.map((link) => (
                    <li>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            {/* 栏目 03 — 联系方式 */}
            <div class="v6-footer__col">
              <p class="v6-footer__col-head">
                CONTACT <span>联系方式</span>
              </p>
              <ul class="v6-footer__list">
                {contact?.email ? (
                  <li>
                    <span class="v6-footer__label">主联系邮箱</span>
                    <a href={`mailto:${contact.email}`}>
                      {contact.emailLabel ?? contact.email}
                    </a>
                  </li>
                ) : null}
                {contact?.secondaryEmail ? (
                  <li>
                    <span class="v6-footer__label">备用邮箱</span>
                    <a href={`mailto:${contact.secondaryEmail}`}>
                      {contact.secondaryEmailLabel ?? contact.secondaryEmail}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>

            {/* 栏目 04 — 官方平台 */}
            <div class="v6-footer__col">
              <p class="v6-footer__col-head">
                OFFICIAL CHANNELS <span>官方平台</span>
              </p>
              <ul class="v6-footer__list">
                {contact?.x ? (
                  <li>
                    <a href={contact.x} target="_blank" rel="noopener">
                      X <span class="v6-footer__handle">{contact.xLabel}</span>
                    </a>
                  </li>
                ) : null}
                {contact?.youtube ? (
                  <li>
                    <a href={contact.youtube} target="_blank" rel="noopener">
                      YouTube{" "}
                      <span class="v6-footer__handle">
                        {contact.youtubeLabel}
                      </span>
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          {opts?.legalNote ? (
            <p class="v6-footer__note">{opts.legalNote}</p>
          ) : null}

          <div class="v6-footer__bottom">
            <nav class="v6-footer__legal" aria-label="页脚次要导航">
              {secondaryNavLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
            <p class="v6-footer__copyright">{opts?.copyright}</p>
          </div>
        </div>
      </footer>
    );
  };

  Footer.css = style;
  return Footer;
}) satisfies QuartzComponentConstructor;

import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/footer.scss";

interface NavLink {
  label: string;
  href: string;
}

interface Options {
  brand?: string;
  nameZh?: string;
  tagline?: string;
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

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const navLinks = opts?.navLinks ?? [];
    const secondaryNavLinks = opts?.secondaryNavLinks ?? [];
    const contact = opts?.contact;
    return (
      <footer class={`inst4-footer ${displayClass ?? ""}`}>
        <div class="inst4-footer__grid">
          <div class="inst4-footer__identity">
            <p class="inst4-footer__brand">{opts?.brand}</p>
            {opts?.nameZh ? (
              <p class="inst4-footer__name">{opts.nameZh}</p>
            ) : null}
            {opts?.tagline ? (
              <p class="inst4-footer__tagline">{opts.tagline}</p>
            ) : null}
          </div>

          <div class="inst4-footer__contact">
            <p class="inst4-footer__col-head">
              CONTACT <span>联系方式</span>
            </p>
            {contact?.email ? (
              <p class="inst4-footer__entry">
                <span>主联系邮箱</span>
                <a href={`mailto:${contact.email}`}>
                  {contact.emailLabel ?? contact.email}
                </a>
              </p>
            ) : null}
            {contact?.secondaryEmail ? (
              <p class="inst4-footer__entry">
                <span>备用邮箱</span>
                <a href={`mailto:${contact.secondaryEmail}`}>
                  {contact.secondaryEmailLabel ?? contact.secondaryEmail}
                </a>
              </p>
            ) : null}
          </div>

          <div class="inst4-footer__channels">
            <p class="inst4-footer__col-head">
              OFFICIAL CHANNELS <span>官方平台</span>
            </p>
            {contact?.x ? (
              <a href={contact.x} target="_blank" rel="noopener">
                X <span>{contact.xLabel}</span>
              </a>
            ) : null}
            {contact?.youtube ? (
              <a href={contact.youtube} target="_blank" rel="noopener">
                YouTube <span>{contact.youtubeLabel}</span>
              </a>
            ) : null}
          </div>
        </div>

        <div class="inst4-footer__bottom">
          <nav class="inst4-footer__secondary" aria-label="页脚导航">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
            {secondaryNavLinks.map((link) => (
              <a
                key={link.href}
                class="inst4-footer__secondary-low"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div class="inst4-footer__meta">
            <span class="inst4-footer__copyright">{opts?.copyright}</span>
          </div>
          {opts?.legalNote ? (
            <p class="inst4-footer__note">{opts.legalNote}</p>
          ) : null}
        </div>
      </footer>
    );
  };

  Footer.css = style;
  return Footer;
}) satisfies QuartzComponentConstructor;

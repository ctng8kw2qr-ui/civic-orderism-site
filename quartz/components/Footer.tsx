import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/footer.scss";

interface Options {
  links: Record<string, string>;
  secondaryLinks?: Record<string, string>;
  brand?: string;
  copyright?: string;
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? [];
    const secondaryLinks = opts?.secondaryLinks ?? [];
    return (
      <footer class={`${displayClass ?? ""}`}>
        {opts?.brand ? <p class="footer-brand">{opts.brand}</p> : null}
        {opts?.copyright ? (
          <p class="footer-copyright">{opts.copyright}</p>
        ) : null}
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
        {Object.keys(secondaryLinks).length ? (
          <ul class="footer-secondary">
            {Object.entries(secondaryLinks).map(([text, link]) => (
              <li>
                <a href={link}>{text}</a>
              </li>
            ))}
          </ul>
        ) : null}
      </footer>
    );
  };

  Footer.css = style;
  return Footer;
}) satisfies QuartzComponentConstructor;

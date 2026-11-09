/** Approved B delivery assets. Shared by HTML preload and picture to avoid duplicate downloads. */
const base = "/static/assets/v6/people/zhao-pengbo-b";
export const homepagePortrait = {
  desktop: {
    src: `${base}-desktop-1086.webp`,
    srcset: `${base}-desktop-768.webp 768w, ${base}-desktop-1086.webp 1086w`,
    sizes: "(max-width: 1100px) 42vw, 509px",
    media: "(min-width: 769px)",
  },
  mobile: {
    src: `${base}-portrait-590.webp`,
    srcset: `${base}-portrait-400.webp 400w, ${base}-portrait-590.webp 590w`,
    sizes:
      "(max-width: 359px) calc(100vw - 36px), (max-width: 559px) calc(100vw - 44px), 40vw",
    media: "(max-width: 768px)",
  },
};

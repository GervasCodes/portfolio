// Responsive image URLs. Off by default.
//
// Supabase Storage can resize and re-encode images on the fly (WebP/AVIF for browsers that accept
// them) through its "render/image" endpoint, but that is a paid-plan feature, so this only turns on
// when you set VITE_IMAGE_TRANSFORMS=supabase at build time. With it off, or for any URL that is not
// a Supabase public object, the original URL is used unchanged (the component still sets width,
// height, lazy/priority loading and a fade-in, so there is no layout shift).

const MODE = import.meta.env?.VITE_IMAGE_TRANSFORMS;
const OBJECT_PATH = /\/storage\/v1\/object\/public\//;
export const DEFAULT_WIDTHS = [480, 800, 1280, 1600];

/** { src, srcSet?, placeholder? } for an image URL. `mode` is injectable for tests. */
export function imageVariants(url, widths = DEFAULT_WIDTHS, mode = MODE) {
  if (!url || mode !== 'supabase' || !OBJECT_PATH.test(url)) return { src: url };
  const base = url.replace(OBJECT_PATH, '/storage/v1/render/image/public/').split('?')[0];
  const at = (w, q = 75) => `${base}?width=${w}&quality=${q}`;
  return {
    src: at(widths[widths.length - 1]),
    srcSet: widths.map((w) => `${at(w)} ${w}w`).join(', '),
    // A 24 px copy, scaled up by the browser, is the blur-up placeholder.
    placeholder: at(24, 30),
  };
}

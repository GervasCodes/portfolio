import { useEffect, useRef, useState } from 'react';
import { imageVariants } from '@/utils/image';

/**
 * <img> with the things every cover needs: explicit width/height (no layout shift), lazy loading
 * unless `priority`, srcset + sizes when the storage can resize (see utils/image.js), and a soft
 * arrival instead of a pop:
 *  - with a placeholder (transforms on): a tiny blurred copy shows underneath until the full image paints;
 *  - without one: the image fades in over the card's tinted background.
 * `priority` images (the likely LCP) are never faded, so they are never held back.
 * Cached images that finish before React attaches onLoad are caught by the `complete` check.
 */
export default function ProgressiveImage({
  src, alt = '', width, height, sizes = '100vw', widths, priority = false, className = '',
}) {
  const ref = useRef(null);
  const v = imageVariants(src, widths);
  const fade = !priority && !v.placeholder;
  const [loaded, setLoaded] = useState(!fade);

  useEffect(() => {
    const el = ref.current;
    if (fade && el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, [src, fade]);

  return (
    <img
      ref={ref}
      src={v.src}
      srcSet={v.srcSet}
      sizes={v.srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      style={v.placeholder ? { backgroundImage: `url(${v.placeholder})`, backgroundSize: 'cover' } : undefined}
      className={`${fade ? 'img-fade' : ''} ${fade && loaded ? 'is-loaded' : ''} ${className}`}
    />
  );
}

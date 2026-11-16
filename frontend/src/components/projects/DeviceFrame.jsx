import { imageVariants } from '@/utils/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PlayCircle } from 'lucide-react';
import PlaceholderArt from '@/components/ui/PlaceholderArt';

/**
 * A screenshot or video inside a CSS laptop frame. Portrait images (phone
 * screenshots) are drawn inside a phone frame that sits on the laptop's screen,
 * so one gallery can mix both. The frame is always 16:10 plus a base, so the
 * switch after the image loads never moves the page (no layout shift).
 * Colours come from tokens only; the art behind a phone is generated, not a screenshot.
 */
export default function DeviceFrame({ item, alt = '', priority = false, className = '' }) {
  const imgRef = useRef(null);
  const [portrait, setPortrait] = useState(false);
  const isVideo = item.media_type === 'video';

  const check = useCallback((img) => {
    if (img?.naturalWidth && img.naturalHeight / img.naturalWidth > 1.15) setPortrait(true);
  }, []);
  useEffect(() => {
    if (imgRef.current?.complete) check(imgRef.current);
  }, [check, item.url]);

  const media = isVideo ? (
    <video
      src={`${item.url}#t=0.1`}
      muted
      playsInline
      preload="metadata"
      tabIndex={-1}
      aria-hidden="true"
      className="h-full w-full object-cover object-top"
    />
  ) : (
    <img
      ref={imgRef}
      src={imageVariants(item.url).src}
      srcSet={imageVariants(item.url).srcSet}
      sizes={imageVariants(item.url).srcSet ? '(min-width: 1024px) 60vw, 100vw' : undefined}
      alt={alt}
      width="1600"
      height="1000"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onLoad={(e) => check(e.currentTarget)}
      className="h-full w-full object-cover object-top"
    />
  );

  return (
    <div className={`relative ${className}`}>
      <div className="relative aspect-[16/10] rounded-t-2xl rounded-b-md border border-line bg-surface-2 p-1.5 shadow-lift sm:p-2.5">
        <div className="relative h-full w-full overflow-hidden rounded-md bg-surface">
          {portrait && (
            <PlaceholderArt seed={item.url} className="absolute inset-0 h-full w-full opacity-70" />
          )}
          <div
            className={
              portrait
                ? 'absolute inset-y-[6%] left-1/2 aspect-[9/19] -translate-x-1/2 overflow-hidden rounded-2xl border-4 border-surface-2 bg-surface shadow-lift'
                : 'absolute inset-0'
            }
          >
            {media}
          </div>
          {isVideo && (
            <span className="absolute inset-0 flex items-center justify-center bg-scrim/30">
              <PlayCircle size={44} aria-hidden="true" className="text-on-scrim" />
            </span>
          )}
        </div>
      </div>
      {/* Laptop base */}
      <div aria-hidden="true" className="relative mx-auto -mt-px h-2 w-[104%] -translate-x-[2%] rounded-b-2xl border border-t-0 border-line bg-surface-2 sm:h-3">
        <span className="absolute left-1/2 top-0 h-1 w-1/5 -translate-x-1/2 rounded-b-md bg-ink/10" />
      </div>
    </div>
  );
}

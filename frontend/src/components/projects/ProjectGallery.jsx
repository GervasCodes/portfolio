import { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import DeviceFrame from '@/components/projects/DeviceFrame';
import Lightbox from '@/components/projects/Lightbox';

/**
 * Normalizes either shape into { id, media_type, url, caption }:
 *  - `media`  : project_media rows (images AND videos)
 *  - `images` : legacy array of plain URL strings (images only)
 */
function normalize(media, images) {
  if (Array.isArray(media) && media.length) {
    return media.filter((m) => m?.url).map((m, i) => ({
      id: m.id ?? i,
      media_type: m.media_type === 'video' ? 'video' : 'image',
      url: m.url,
      caption: m.caption || '',
    }));
  }
  if (Array.isArray(images)) {
    return images.filter(Boolean).map((url, i) => ({ id: i, media_type: 'image', url, caption: '' }));
  }
  return [];
}

const OPEN = 'group block w-full text-left rounded-2xl focus-visible:outline-offset-4';

/**
 * Clickable thumbnails that open a keyboard-accessible lightbox.
 *  - variant "devices": laptop/phone frames (case studies); `columns={1}` makes each one full width
 *  - variant "plain"  : simple grid (certificates, achievements)
 * Pass `items` (already normalised) to skip normalising `media` / `images`.
 */
export default function ProjectGallery({ media, images = [], items: given, variant = 'plain', from = 0, to, columns = 2, priority = false, label }) {
  const all = given || normalize(media, images);
  const [active, setActive] = useState(null);
  if (!all.length) return null;

  // `from`/`to` pick which screens this instance draws (the case study shows the first one as a
  // full-width hero and the rest further down); every instance's lightbox still holds all screens.
  const shown = all.slice(from, to);
  const offset = from;
  if (!shown.length) return null;
  const describe = (item, i) => item.caption || `Screen ${i + 1} of ${all.length}`;

  return (
    <>
      {variant === 'devices' ? (
        <ul className={`grid gap-8 md:gap-10 ${columns === 1 ? '' : 'md:grid-cols-2'}`}>
          {shown.map((item, i) => (
            <li key={item.id}>
              <button type="button" className={OPEN} onClick={() => setActive(i + offset)} aria-label={`${item.media_type === 'video' ? 'Play' : 'Open'}: ${describe(item, i + offset)}`}>
                <DeviceFrame item={item} priority={priority && i === 0} className="transition-transform duration-base ease-standard group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {shown.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActive(i + offset)}
                aria-label={`${item.media_type === 'video' ? 'Play' : 'Open'}: ${describe(item, i + offset)}`}
                className="surface surface-hover group relative block aspect-video w-full overflow-hidden rounded-lg"
              >
                {item.media_type === 'video' ? (
                  <>
                    <video src={`${item.url}#t=0.1`} muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-scrim/30"><PlayCircle size={32} aria-hidden="true" className="text-on-scrim" /></span>
                  </>
                ) : (
                  <img src={item.url} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Lightbox items={all} index={active} onIndex={setActive} onClose={() => setActive(null)} label={label} />
    </>
  );
}

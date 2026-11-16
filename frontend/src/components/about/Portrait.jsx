import PlaceholderArt from '@/components/ui/PlaceholderArt';
import { initials } from '@/utils/aboutContent';

/**
 * Portrait in the same duotone treatment as the Home hero: the real photo in
 * greyscale with an accent tint, inside the accent glow. With no avatar it
 * shows designed placeholder art and the owner's initials (never a stock
 * photo, never a blank box). Fixed 4:5 box, so nothing shifts when it loads.
 */
export default function Portrait({ name, src }) {
  return (
    <figure className="relative m-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface-2 shadow-glow">
        {src ? (
          <>
            <img
              src={src}
              alt={name ? `Portrait of ${name}` : 'Portrait'}
              width="800"
              height="1000"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top grayscale contrast-110"
            />
            {/* Duotone: accent tint over the greyscale photo. Decorative. */}
            <div aria-hidden="true" className="absolute inset-0 bg-accent mix-blend-soft-light opacity-70" />
            <div aria-hidden="true" className="absolute inset-0 bg-accent/10 mix-blend-multiply" />
          </>
        ) : (
          <>
            <PlaceholderArt seed={name || 'portrait'} className="absolute inset-0 h-full w-full" />
            {initials(name) && (
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-display text-8xl text-ink/70">
                {initials(name)}
              </span>
            )}
          </>
        )}
      </div>
    </figure>
  );
}

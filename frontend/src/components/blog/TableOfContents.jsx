import { useEffect, useState } from 'react';

/**
 * "On this page" built from the rendered article (h2/h3 with ids), so it can
 * never disagree with what is on screen. The current section is highlighted
 * as you read (IntersectionObserver, no scroll listener). Needs 2+ headings.
 * `variant="rail"` is the sticky desktop column; `variant="inline"` is a
 * collapsible list for small screens.
 */
export default function TableOfContents({ containerRef, contentKey, variant = 'rail' }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;
    const heads = [...root.querySelectorAll('h2[id], h3[id]')];
    setItems(heads.map((h) => ({ id: h.id, text: h.textContent, level: h.tagName === 'H3' ? 3 : 2 })));
    if (!heads.length || !('IntersectionObserver' in window)) return undefined;
    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        const first = heads.find((h) => visible.has(h.id));
        if (first) setActive(first.id);
      },
      { rootMargin: '-96px 0px -65% 0px' },
    );
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [containerRef, contentKey]);

  if (items.length < 2) return null;

  const list = (
    <ol className="m-0 list-none space-y-1 p-0 text-sm">
      {items.map((it) => (
        <li key={it.id} className={it.level === 3 ? 'pl-4' : ''}>
          <a
            href={`#${it.id}`}
            aria-current={active === it.id ? 'location' : undefined}
            className={`border-l pl-4 leading-snug transition-colors duration-fast ${variant === 'inline' ? 'flex min-h-11 items-center' : 'block py-1.5'} ${
              active === it.id ? 'border-accent text-ink' : 'border-line text-muted hover:text-ink'
            }`}
          >
            {it.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === 'inline') {
    return (
      <details className="mb-10 rounded-2xl border border-line bg-surface px-5 py-1 xl:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center font-mono text-xs uppercase tracking-[0.12em] text-muted">
          On this page
        </summary>
        <nav aria-label="On this page" className="pb-3">{list}</nav>
      </details>
    );
  }
  return (
    <nav aria-label="On this page" className="hidden xl:block">
      <p className="section-label mb-4">On this page</p>
      {list}
    </nav>
  );
}

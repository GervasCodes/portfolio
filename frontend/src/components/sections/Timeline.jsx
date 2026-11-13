function formatDate(date) {
  if (!date) return 'Present';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

/** Experience or education as plain rows: dates | role, organisation, description. */
export default function Timeline({ title, items = [], id, bare = false }) {
  if (!items.length) return null;
  const list = (
    <>
      <h2 className="font-display text-3xl font-normal tracking-tight mb-8">{title}</h2>
      <ul className="divide-y divide-line border-y border-line">
          {items.map((item, i) => (
            <li key={item.id || i} className="grid gap-1 py-5 md:grid-cols-[1fr_3fr] md:gap-10">
              <p className="text-sm text-muted">
                {formatDate(item.start_date)} – {item.is_current ? 'Present' : formatDate(item.end_date)}
              </p>
              <div>
                <h3 className="font-display text-lg">{item.title}</h3>
                {item.organization && <p className="text-sm text-muted">{item.organization}</p>}
                {item.description && <p className="mt-2 max-w-prose">{item.description}</p>}
              </div>
            </li>
        ))}
      </ul>
    </>
  );
  if (bare) return <section id={id} className="mb-12">{list}</section>;
  return (
    <section id={id} className="py-12 border-t border-line scroll-mt-24">
      <div className="container-page">{list}</div>
    </section>
  );
}

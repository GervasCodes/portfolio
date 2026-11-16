import EmptyState from './EmptyState';

/**
 * Semantic, horizontally scrollable table in a rounded hairline frame.
 * columns: [{ key, header, render?(row), className? }]
 */
export default function Table({ columns, rows, caption, rowKey = 'id', empty, className = '' }) {
  if (!rows?.length) {
    return empty || <EmptyState title="Nothing here yet" />;
  }
  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-line bg-surface ${className}`}
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="w-full text-sm text-left border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="bg-surface-2">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`py-3 px-4 font-mono text-xs font-medium uppercase tracking-wider text-muted border-b border-line whitespace-nowrap ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-line last:border-b-0 hover:bg-ink/[0.03] transition-colors duration-fast">
              {columns.map((col) => (
                <td key={col.key} className={`py-3 px-4 align-top ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

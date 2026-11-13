/**
 * Minimal bar chart in plain HTML/CSS (replaces recharts, ~400 kB).
 * Each bar has a text label and value, so it works without hover or colour.
 *  - orientation "horizontal": one labelled row per item (good for categories)
 *  - orientation "vertical":   columns over time (good for daily counts)
 */
export default function BarSeries({
  data,
  labelKey,
  valueKey,
  max,
  orientation = 'horizontal',
  formatValue = (v) => String(v),
  label,
}) {
  const top = max ?? Math.max(1, ...data.map((d) => Number(d[valueKey]) || 0));

  if (orientation === 'vertical') {
    return (
      <figure aria-label={label} className="m-0">
        <div className="flex items-end gap-1 h-36 border-b border-line">
          {data.map((d) => {
            const v = Number(d[valueKey]) || 0;
            return (
              <div
                key={d[labelKey]}
                className="flex-1 bg-accent min-h-px rounded-t-sm"
                style={{ height: `${(v / top) * 100}%` }}
                title={`${d[labelKey]}: ${formatValue(v)}`}
              />
            );
          })}
        </div>
        <figcaption className="mt-2 flex justify-between text-xs text-muted">
          <span>{data[0]?.[labelKey]}</span>
          <span>peak {formatValue(top)}</span>
          <span>{data[data.length - 1]?.[labelKey]}</span>
        </figcaption>
      </figure>
    );
  }

  return (
    <ul aria-label={label} className="space-y-3 m-0 p-0 list-none">
      {data.map((d) => {
        const v = Number(d[valueKey]) || 0;
        return (
          <li key={d[labelKey]}>
            <div className="flex justify-between text-sm mb-1">
              <span>{d[labelKey]}</span>
              <span className="text-muted">{formatValue(v)}</span>
            </div>
            <div className="h-2 bg-line rounded-sm overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, (v / top) * 100)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

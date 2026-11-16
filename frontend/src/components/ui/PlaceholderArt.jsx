import { useId } from 'react';

/**
 * Designed placeholder art for empty states and (from Phase 4) cover images
 * that have no picture. Deterministic from `seed`, pure SVG, no filters and no
 * animation, so it costs almost nothing. Colours come from tokens only.
 */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function PlaceholderArt({ seed = 'portfolio', className = '', label }) {
  const uid = useId().replace(/:/g, '');
  const h = hash(seed);
  const pick = (shift, mod) => (h >>> shift) % mod;
  const blobs = [
    { cx: 18 + pick(0, 30), cy: 25 + pick(4, 30), r: 38 + pick(8, 14), tone: 'accent', o: 0.55 },
    { cx: 55 + pick(12, 30), cy: 45 + pick(16, 35), r: 34 + pick(20, 14), tone: 'accent-2', o: 0.4 },
    { cx: 30 + pick(24, 40), cy: 70 + pick(28, 20), r: 30 + pick(2, 12), tone: 'accent', o: 0.28 },
  ];
  const stroke = (tone) => `rgb(var(--${tone}))`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      <defs>
        {blobs.map((b, i) => (
          <radialGradient key={i} id={`${uid}-g${i}`}>
            <stop offset="0%" stopColor={stroke(b.tone)} stopOpacity={b.o} />
            <stop offset="100%" stopColor={stroke(b.tone)} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <rect width="100" height="100" fill="rgb(var(--surface-2))" />
      {blobs.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={`url(#${uid}-g${i})`} />
      ))}
      <circle cx={28 + pick(6, 44)} cy={34 + pick(10, 30)} r="14" fill="none" stroke="rgb(var(--text))" strokeOpacity="0.22" />
      <circle cx={28 + pick(6, 44)} cy={34 + pick(10, 30)} r="24" fill="none" stroke="rgb(var(--text))" strokeOpacity="0.1" />
    </svg>
  );
}

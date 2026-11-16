import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import Button, { IconButton } from '@/components/ui/Buttons';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import TextLink from '@/components/ui/TextLink';
import SectionHeader from '@/components/ui/SectionHeader';
import Prose from '@/components/ui/Prose';
import Markdown from '@/components/ui/Markdown';
import { Field, Input, Textarea, Select } from '@/components/ui/Field';
import Table from '@/components/ui/Table';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/modal';
import Pagination from '@/components/ui/Pagination';
import BarSeries from '@/components/ui/BarSeries';
import PlaceholderArt from '@/components/ui/PlaceholderArt';
import Reveal from '@/components/ui/Reveal';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Developer-only component gallery at /dev/styleguide (registered in App.jsx
 * behind import.meta.env.DEV, so it is not in the production bundle).
 * Every section renders twice, in a forced dark and a forced light panel
 * (data-theme on the wrapper), so both themes are always visible side by side.
 */

const COLOURS = [
  ['bg', 'bg-bg'], ['surface', 'bg-surface'], ['surface-2', 'bg-surface-2'], ['text', 'bg-ink'],
  ['muted', 'bg-muted'], ['accent', 'bg-accent'], ['accent-2', 'bg-accent-2'], ['control', 'bg-control'],
  ['danger', 'bg-danger'], ['success', 'bg-success'], ['warning', 'bg-warning'],
];

// Text/background pairs whose live contrast the panel prints (var names, min ratio).
const PAIRS = [
  ['text', 'bg', 4.5], ['muted', 'bg', 4.5], ['muted', 'surface-2', 4.5],
  ['accent', 'bg', 4.5], ['accent-ink', 'accent', 4.5], ['control', 'surface', 3],
];

const SCALE = [
  ['text-display font-display', 'display'],
  ['text-5xl font-display', '5xl'],
  ['text-4xl font-display', '4xl'],
  ['text-3xl font-display', '3xl'],
  ['text-2xl font-display', '2xl'],
  ['text-xl', 'xl'],
  ['text-lg', 'lg'],
  ['text-base', 'base 17-18 / 1.6'],
  ['text-sm', 'sm'],
  ['text-xs font-mono uppercase tracking-widest', 'xs mono label'],
];

const SAMPLE_ROWS = [
  { id: 1, name: 'Portfolio CMS', role: 'Full stack', year: 2026 },
  { id: 2, name: 'Inventory API', role: 'Backend', year: 2025 },
];

const SAMPLE_MD = `## Heading two\n\nBody text with a [link](#) and \`inline code\`.\n\n- First point\n- Second point\n\n> A pull quote set in the display face.\n\n\`\`\`js\nconst answer = 42;\n\`\`\`\n`;

const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const contrast = (a, b) => { const [hi, lo] = lum(a) > lum(b) ? [a, b] : [b, a]; return (lum(hi) + 0.05) / (lum(lo) + 0.05); };

function Panel({ theme, children }) {
  return (
    <div
      data-theme={theme}
      className="bg-bg text-ink rounded-3xl border border-line p-5 md:p-7 min-w-0"
    >
      <p className="section-label mb-5">{theme} theme</p>
      {children}
    </div>
  );
}

/** Renders its children once in a dark and once in a light panel. */
function Both({ title, note, children }) {
  return (
    <section className="py-10 border-t border-line">
      <p className="section-label">{title}</p>
      {note && <p className="text-sm text-muted mt-2 max-w-3xl">{note}</p>}
      <div className="mt-5 grid xl:grid-cols-2 gap-5">
        <Panel theme="dark">{children}</Panel>
        <Panel theme="light">{children}</Panel>
      </div>
    </section>
  );
}

function Swatches() {
  const ref = useRef(null);
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const cs = getComputedStyle(ref.current);
    const get = (k) => cs.getPropertyValue(`--${k}`).trim().split(/\s+/).map(Number);
    setRows(PAIRS.map(([fg, bg, min]) => {
      const r = contrast(get(fg), get(bg));
      return { fg, bg, min, r };
    }));
  }, []);
  return (
    <div ref={ref}>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {COLOURS.map(([name, cls]) => (
          <div key={name} className="card">
            <div className={`h-12 ${cls} border-b border-line`} />
            <p className="p-2.5 text-xs font-mono">{name}</p>
          </div>
        ))}
        <div className="card">
          <div className="h-12 bg-ink/10 border-b border-line" />
          <p className="p-2.5 text-xs font-mono">line (hairline)</p>
        </div>
      </div>
      <ul className="mt-5 space-y-1 text-xs font-mono text-muted">
        {rows.map((x) => (
          <li key={`${x.fg}-${x.bg}`}>
            {x.fg} on {x.bg}: <span className="text-ink">{x.r.toFixed(2)}:1</span> {x.r >= x.min ? 'AA pass' : 'FAIL'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StyleguidePage() {
  const toast = useToast();
  const { preference, setTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="container-page pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 2rem)' }}>
      <SectionHeader
        number="00"
        eyebrow="Developer only"
        title={<>Style<em>guide</em></>}
        description="Every token, primitive and state, rendered in a forced dark and a forced light panel. Not included in the production build."
        as="h1"
      />
      <div className="flex flex-wrap items-center gap-3 -mt-4 mb-6">
        <ThemeToggle />
        {['system', 'dark', 'light'].map((p) => (
          <Button key={p} size="sm" variant={preference === p ? 'primary' : 'secondary'} onClick={() => setTheme(p)} aria-pressed={preference === p}>
            {p}
          </Button>
        ))}
        <span className="text-sm text-muted">Page theme preference (saved). The panels below ignore it.</span>
      </div>

      <Both title="Colour tokens" note="Live contrast is computed from the CSS variables of each panel. scripts/check-design.js verifies 50 pairs from tokens.css.">
        <Swatches />
      </Both>

      <Both title="Typography" note="Display: Instrument Serif (italic accents). UI: Geist. Labels: Geist Mono. Body 17-18 px, line-height 1.6.">
        <h2 className="font-display text-5xl text-balance">Building <em>calm</em> software for busy people</h2>
        <div className="space-y-3 mt-6">
          {SCALE.map(([cls, label]) => (
            <p key={label} className={`${cls} truncate`}>{label}</p>
          ))}
        </div>
        <p className="mt-6 max-w-prose">It’s a “real” apostrophe and quote pair, set in the UI sans at body size so line length and rhythm can be judged.</p>
      </Both>

      <Both title="Radius, shadow, glow" note="Radius 8 / 14 / 22 / 32 + full. Shadows: card, lift, overlay. Glow is the accent hover/focus token.">
        <div className="grid grid-cols-2 gap-4">
          {[['rounded-md', '8'], ['rounded-lg', '14'], ['rounded-2xl', '22'], ['rounded-3xl', '32']].map(([c, n]) => (
            <div key={c} className={`h-16 border border-control ${c} flex items-center justify-center text-xs font-mono`}>{n}px</div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-5">
          {[['shadow-card', 'card'], ['shadow-lift', 'lift'], ['shadow-overlay', 'overlay'], ['shadow-glow', 'glow']].map(([c, n]) => (
            <div key={c} className={`h-20 rounded-2xl bg-surface-2 ${c} flex items-center justify-center text-xs font-mono`}>{n}</div>
          ))}
        </div>
      </Both>

      <Both title="Buttons" note="Primary (accent, gradient glow on hover), secondary, ghost, danger. Magnetic on a fine pointer; static on touch and reduced motion. Tab to see the focus ring.">
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<ArrowRight size={16} />}>Start a project</Button>
          <Button variant="secondary" icon={<Download size={16} />}>Resume</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <IconButton label="Example icon button" icon={<ArrowRight size={16} />} />
          <ThemeToggle />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Both>

      <Both title="Links and tags">
        <p>Body copy with an <TextLink href="#">inline link</TextLink> and an <TextLink href="https://example.com">external link</TextLink>.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Tag>Neutral</Tag><Tag tone="accent">Accent</Tag><Tag tone="success">Success</Tag>
          <Tag tone="warning">Warning</Tag><Tag tone="danger">Danger</Tag>
        </div>
      </Both>

      <Both title="Cards" note="Hover a card with a mouse to see the pointer-follow spotlight (disabled on touch and reduced motion).">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-5"><p className="font-display text-2xl">Static card</p><p className="text-muted mt-1">Surface, hairline, layered shadow, spotlight.</p></Card>
          <Card as="a" href="#" interactive className="p-5 block"><p className="font-display text-2xl">Interactive</p><p className="text-muted mt-1">Lifts and gets an accent edge.</p></Card>
          <Card raised spotlight={false} className="p-5"><p className="font-display text-2xl">Raised, no spotlight</p></Card>
        </div>
      </Both>

      <Both title="Section header" note="Oversized decorative number + mono label + display heading with an italic accent.">
        <SectionHeader number="01" eyebrow="Work" title={<>Selected <em>work</em></>} description="Projects pulled from the CMS." className="!mb-0" />
      </Both>

      <Both title="Form fields">
        <div className="grid gap-5">
          <Field label="Name" hint="As you want it shown publicly." required><Input placeholder="Your name" /></Field>
          <Field label="Email" error="Enter a valid email address." required><Input type="email" defaultValue="not-an-email" /></Field>
          <Field label="Topic"><Select defaultValue=""><option value="" disabled>Choose one</option><option>Project</option><option>Job</option></Select></Field>
          <Field label="Disabled"><Input disabled defaultValue="Read only value" /></Field>
          <Field label="Message"><Textarea placeholder="Tell me about the project" /></Field>
        </div>
      </Both>

      <Both title="Table, bars, pagination">
        <Table
          caption="Example projects"
          rows={SAMPLE_ROWS}
          columns={[
            { key: 'name', header: 'Project' },
            { key: 'role', header: 'Role' },
            { key: 'year', header: 'Year', render: (r) => <Tag>{r.year}</Tag> },
          ]}
        />
        <div className="mt-6">
          <BarSeries
            label="Example skill levels"
            data={[{ k: 'React', v: 90 }, { k: 'Node.js', v: 80 }, { k: 'PostgreSQL', v: 65 }]}
            labelKey="k"
            valueKey="v"
            max={100}
            formatValue={(v) => `${v}%`}
          />
        </div>
        <div className="mt-6"><BarSeries orientation="vertical" label="Example daily visits" data={[3, 6, 4, 9, 7, 12, 8].map((v, i) => ({ k: `D${i + 1}`, v }))} labelKey="k" valueKey="v" /></div>
        <Pagination basePath="/dev/styleguide" page={3} limit={10} total={80} />
      </Both>

      <Both title="Empty, error, placeholder art" note="Empty states are designed, never blank. PlaceholderArt is deterministic from a seed (reused for project covers in Phase 4).">
        <EmptyState title="No projects yet" description="Add your first project from the admin dashboard." action={<Button size="sm" href="#">Add project</Button>} />
        <div className="mt-4"><ErrorState message="The server did not respond." onRetry={() => toast.info('Retrying…')} /></div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {['alpha', 'bravo', 'charlie'].map((s) => (
            <div key={s} className="aspect-[4/3] rounded-2xl overflow-hidden border border-line"><PlaceholderArt seed={s} className="w-full h-full" /></div>
          ))}
        </div>
        <div className="mt-4 space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
      </Both>

      <Both title="Motion and effects" note="Ambient glow (the one allowed loop), marquee, scroll reveal (once), film grain. All are removed for prefers-reduced-motion.">
        <div className="relative overflow-hidden rounded-3xl border border-line grain h-40 mb-5">
          <div className="glow-hero ambient" />
          <p className="relative z-10 p-5 font-display text-3xl">Ambient glow + <em>grain</em></p>
        </div>
        <div className="marquee" aria-label="Example marquee">
          <div className="marquee-track font-mono text-sm uppercase tracking-widest text-muted">
            {['React', 'Node.js', 'PostgreSQL', 'Tailwind', 'Vite', 'Framer Motion'].map((t) => <span key={t}>{t}</span>)}
            {['React', 'Node.js', 'PostgreSQL', 'Tailwind', 'Vite', 'Framer Motion'].map((t) => <span key={`d-${t}`} className="marquee-dup" aria-hidden="true">{t}</span>)}
          </div>
        </div>
        <Reveal className="mt-5"><Card className="p-5"><p className="font-display text-xl">Revealed once on scroll</p></Card></Reveal>
        <p className="mt-6 text-center wordmark text-6xl">Wordmark</p>
      </Both>

      <Both title="Prose (Markdown output)">
        <Markdown>{SAMPLE_MD}</Markdown>
        <Prose className="mt-8"><p>The same styles are available for hand-written long-form content through the Prose wrapper.</p></Prose>
      </Both>

      <section className="py-10 border-t border-line">
        <p className="section-label">Feedback (uses the current page theme)</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button variant="secondary" size="sm" onClick={() => toast.success('Saved')}>Success toast</Button>
          <Button variant="secondary" size="sm" onClick={() => toast.error('Save failed. Your changes were not stored.')}>Error toast</Button>
          <Button variant="secondary" size="sm" onClick={() => toast.info('Heads up.')}>Info toast</Button>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>Open modal</Button>
        </div>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example dialog">
          <p className="text-muted">Focus moves into this dialog and stays inside it (Tab and Shift+Tab loop). Escape closes it and focus returns to the button that opened it.</p>
          <div className="mt-6 flex gap-3"><Button size="sm" onClick={() => setModalOpen(false)}>Confirm</Button><Button size="sm" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button></div>
        </Modal>
      </section>
    </main>
  );
}

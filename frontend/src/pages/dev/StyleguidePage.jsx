import { useState } from 'react';
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
import { useToast } from '@/components/ui/Toast';

/**
 * Developer-only component gallery at /dev/styleguide. It is registered in
 * App.jsx behind import.meta.env.DEV, so it is not part of the production
 * bundle. Every primitive appears in every state it supports.
 */

const SWATCHES = [
  ['bg', 'bg-bg'], ['surface', 'bg-surface'], ['ink', 'bg-ink'], ['muted', 'bg-muted'],
  ['line', 'bg-line'], ['accent', 'bg-accent'], ['danger', 'bg-danger'],
  ['success', 'bg-success'], ['warning', 'bg-warning'],
];

const SCALE = [
  ['text-4xl font-display', '49 / display'],
  ['text-3xl font-display', '39 / heading 1'],
  ['text-2xl font-display', '31 / heading 2'],
  ['text-xl font-display', '25 / heading 3'],
  ['text-lg', '20 / lede'],
  ['text-base', '17 / body'],
  ['text-sm', '15 / small'],
  ['text-xs uppercase tracking-wider', '13 / label'],
];

const SAMPLE_ROWS = [
  { id: 1, name: 'Portfolio CMS', role: 'Full stack', year: 2026 },
  { id: 2, name: 'Inventory API', role: 'Backend', year: 2025 },
];

const SAMPLE_MD = `## Heading two\n\nBody text with a [link](#) and \`inline code\`.\n\n- First point\n- Second point\n\n> A pull quote set in the display face.\n\n\`\`\`js\nconst answer = 42;\n\`\`\`\n`;

function Block({ title, children }) {
  return (
    <section className="py-10 border-t border-line">
      <p className="section-label">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function StyleguidePage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="container-page pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 2rem)' }}>
      <SectionHeader
        eyebrow="Developer only"
        title="Styleguide"
        description="Every shared component in every state. Not included in the production build."
        as="h1"
      />

      <Block title="Colour tokens">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SWATCHES.map(([name, cls]) => (
            <div key={name} className="card">
              <div className={`h-12 ${cls} border-b border-line`} />
              <p className="p-2.5 text-xs font-mono">{name}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Type scale">
        <div className="space-y-3">
          {SCALE.map(([cls, label]) => (
            <p key={label} className={cls}>{label} <span className="text-muted text-sm font-sans normal-case tracking-normal">The quick brown fox</span></p>
          ))}
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<ArrowRight size={16} />}>Primary</Button>
          <Button variant="secondary" icon={<Download size={16} />}>Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <IconButton label="Example icon button" icon={<ArrowRight size={16} />} />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Block>

      <Block title="Links and tags">
        <p>Body copy with an <TextLink href="#">inline link</TextLink> and an <TextLink href="https://example.com">external link</TextLink>.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Tag>Neutral</Tag><Tag tone="accent">Accent</Tag><Tag tone="success">Success</Tag>
          <Tag tone="warning">Warning</Tag><Tag tone="danger">Danger</Tag>
        </div>
      </Block>

      <Block title="Cards">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5"><p className="font-display text-xl">Static card</p><p className="text-muted mt-1">Flat surface, 1px border, no shadow.</p></Card>
          <Card as="a" href="#" interactive className="p-5 block"><p className="font-display text-xl">Interactive card</p><p className="text-muted mt-1">Border darkens on hover and focus.</p></Card>
        </div>
      </Block>

      <Block title="Form fields">
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
          <Field label="Name" hint="As you want it shown publicly." required><Input placeholder="Your name" /></Field>
          <Field label="Email" error="Enter a valid email address." required><Input type="email" defaultValue="not-an-email" /></Field>
          <Field label="Topic"><Select defaultValue=""><option value="" disabled>Choose one</option><option>Project</option><option>Job</option></Select></Field>
          <Field label="Disabled"><Input disabled defaultValue="Read only value" /></Field>
          <Field label="Message" className="md:col-span-2"><Textarea placeholder="Tell me about the project" /></Field>
        </div>
      </Block>

      <Block title="Table, empty and error states">
        <Table
          caption="Example projects"
          rows={SAMPLE_ROWS}
          columns={[
            { key: 'name', header: 'Project' },
            { key: 'role', header: 'Role' },
            { key: 'year', header: 'Year', render: (r) => <Tag>{r.year}</Tag> },
          ]}
        />
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <EmptyState title="No projects yet" description="Add your first project from the admin dashboard." action={<Button size="sm" href="#">Add project</Button>} />
          <ErrorState message="The server did not respond." onRetry={() => toast.info('Retrying…')} />
        </div>
      </Block>

      <Block title="Feedback: toast, modal, skeleton">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={() => toast.success('Saved')}>Success toast</Button>
          <Button variant="secondary" size="sm" onClick={() => toast.error('Save failed. Your changes were not stored.')}>Error toast</Button>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>Open modal</Button>
        </div>
        <div className="mt-6 space-y-3 max-w-md">
          <Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" />
        </div>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example dialog">
          <p className="text-muted">Focus moves into this dialog, Escape closes it, and focus returns to the button that opened it.</p>
        </Modal>
      </Block>

      <Block title="Prose (Markdown output)">
        <Markdown>{SAMPLE_MD}</Markdown>
        <Prose className="mt-8"><p>The same styles are available for hand-written long-form content through the Prose wrapper.</p></Prose>
      </Block>
    </main>
  );
}

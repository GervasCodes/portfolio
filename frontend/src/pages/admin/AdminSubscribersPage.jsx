import { useCallback, useEffect, useState } from 'react';
import {
  Users, Search, Trash2, Download, RefreshCw, ChevronLeft, ChevronRight,
  MailCheck, MailWarning, MailX, Loader2,
} from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Buttons';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PortfolioAPI } from '@/services/api';

const PAGE_SIZE = 25;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'pending', label: 'Pending' },
  { key: 'unsubscribed', label: 'Unsubscribed' },
];

const STATUS_STYLES = {
  confirmed: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', Icon: MailCheck },
  pending: { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30', Icon: MailWarning },
  unsubscribed: { cls: 'bg-ink/5 text-ink/45 border-ink/15', Icon: MailX },
};

function StatusPill({ status }) {
  const { cls, Icon } = STATUS_STYLES[status] || STATUS_STYLES.unsubscribed;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${cls}`}>
      <Icon size={12} className="shrink-0" />
      {status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Small stat tile — same visual language as the other admin dashboards. */
function StatTile({ label, value, tone = 'default' }) {
  const toneCls = {
    default: 'text-gradient',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    muted: 'text-ink/45',
  }[tone];
  return (
    <div className="card-premium glass-hover p-5 text-center">
      <p className={`font-display text-2xl md:text-3xl font-bold ${toneCls}`}>{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-ink/45 mt-1.5">{label}</p>
    </div>
  );
}

/**
 * Newsletter subscribers console.
 *
 * Read-only by design apart from "remove", because the subscription
 * lifecycle itself (pending -> confirmed -> unsubscribed) is driven by the
 * double opt-in links the visitor clicks — an admin flipping a status by
 * hand would break that consent trail. Removing exists for "forget me"
 * requests, where deleting the row is the point.
 */
export default function AdminSubscribersPage() {
  const { checking } = useAdminAuth();

  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, confirmed: 0, unsubscribed: 0 });
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, meta: resMeta, error: err } = await PortfolioAPI.getNewsletterSubscribers({
      page, limit: PAGE_SIZE, status, search: debouncedSearch,
    });
    if (err) {
      setError(err);
    } else {
      setError('');
      setItems(data?.items || []);
      setCounts(data?.counts || { all: 0, pending: 0, confirmed: 0, unsubscribed: 0 });
      setMeta({ total: resMeta?.total ?? 0, page: resMeta?.page ?? 1, pages: resMeta?.pages ?? 1 });
    }
    setLoading(false);
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    if (!checking) load();
  }, [checking, load]);

  // A new filter or query invalidates whatever page number we were on.
  useEffect(() => { setPage(1); }, [status, debouncedSearch]);

  if (checking) return null;

  const handleDelete = async (subscriber) => {
    if (!window.confirm(`Remove ${subscriber.email} from the list? This cannot be undone.`)) return;
    setDeletingId(subscriber.id);
    const { error: err } = await PortfolioAPI.deleteNewsletterSubscriber(subscriber.id);
    setDeletingId(null);
    if (err) {
      setError(err);
      return;
    }
    load();
  };

  // Exports exactly what's on screen (current filter + query), not the whole
  // table — that's almost always what you actually want to hand to a mailer.
  const handleExport = () => {
    const rows = [
      ['email', 'status', 'signed_up', 'confirmed_at', 'unsubscribed_at'],
      ...items.map((s) => [
        s.email, s.status, s.created_at || '', s.confirmed_at || '', s.unsubscribed_at || '',
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers-${status}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell
      title="Subscribers"
      description="Everyone who signed up for new-post notifications, and where they are in the double opt-in flow."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total" value={counts.all} />
        <StatTile label="Confirmed" value={counts.confirmed} tone="emerald" />
        <StatTile label="Pending" value={counts.pending} tone="amber" />
        <StatTile label="Unsubscribed" value={counts.unsubscribed} tone="muted" />
      </div>

      {/* Filter bar */}
      <div className="glass rounded-2xl p-4 mb-5 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const active = status === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatus(tab.key)}
                aria-pressed={active}
                className={`text-sm px-3.5 py-2 rounded-xl border transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-accent/25 to-cyan-accent/10 text-accent-dark font-medium border-accent/30'
                    : 'text-ink/60 hover:text-ink hover:bg-ink/5 border-transparent'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-[11px] text-ink/40">{counts[tab.key] ?? 0}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:ml-auto flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35 pointer-events-none" />
            <label htmlFor="subscriber-search" className="sr-only">Search subscribers by email</label>
            <input
              id="subscriber-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full input-field pl-9 pr-3 py-2.5 text-sm"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={load} icon={<RefreshCw size={15} />}>
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={!items.length}
            icon={<Download size={15} />}
          >
            <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="glass rounded-2xl p-4 mb-5 text-sm text-red-400">{error}</p>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-ink/45 text-sm">
            <Loader2 size={18} className="animate-spin" /> Loading subscribers...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={28} className="mx-auto text-ink/20 mb-3" />
            <p className="text-sm text-ink/50">
              {search || status !== 'all'
                ? 'No subscribers match this filter.'
                : 'No one has subscribed yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink/40 border-b border-ink/10">
                  <th scope="col" className="font-medium px-5 py-3.5">Email</th>
                  <th scope="col" className="font-medium px-5 py-3.5">Status</th>
                  <th scope="col" className="font-medium px-5 py-3.5 whitespace-nowrap">Signed up</th>
                  <th scope="col" className="font-medium px-5 py-3.5 whitespace-nowrap">Confirmed</th>
                  <th scope="col" className="font-medium px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.03] transition-colors">
                    <td className="px-5 py-3.5 max-w-[240px]">
                      <span className="block truncate" title={subscriber.email}>{subscriber.email}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusPill status={subscriber.status} /></td>
                    <td className="px-5 py-3.5 text-ink/55 whitespace-nowrap">{formatDate(subscriber.created_at)}</td>
                    <td className="px-5 py-3.5 text-ink/55 whitespace-nowrap">{formatDate(subscriber.confirmed_at)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(subscriber)}
                        disabled={deletingId === subscriber.id}
                        aria-label={`Remove ${subscriber.email}`}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-ink/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      >
                        {deletingId === subscriber.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Trash2 size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.pages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-5">
          <p className="text-xs text-ink/45">
            Page {meta.page} of {meta.pages} · {meta.total} subscriber{meta.total === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={meta.page <= 1}
              aria-label="Previous page"
              className="glass glass-hover w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, meta.pages))}
              disabled={meta.page >= meta.pages}
              aria-label="Next page"
              className="glass glass-hover w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

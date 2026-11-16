import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Copy, FileText, Folder, Mail, Moon, Search as SearchIcon, Sun,
} from 'lucide-react';
import { PortfolioAPI } from '@/services/api';
import { useProfile } from '@/hooks/useProfile';
import { useNavLinks } from '@/hooks/useNavLinks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useTheme } from '@/theme/ThemeProvider';
import { useToast } from '@/components/ui/Toast';
import { copyText } from '@/utils/clipboard';

/**
 * Command palette (Cmd/Ctrl+K, or the navbar button). Glass is allowed here.
 * Jump to pages, projects and posts, switch theme, copy the email address.
 * Projects/posts come from the existing GET /api/search endpoint; with an
 * empty query it shows featured projects and recent posts instead.
 * Keyboard: Up/Down/Home/End move, Enter runs, Escape closes. ARIA combobox +
 * listbox pattern (focus stays in the input, aria-activedescendant follows).
 */
const EASE = [0.22, 1, 0.36, 1];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared across opens so the empty-state lists load once per visit.
let defaultsCache = null;

const asList = (v) => (Array.isArray(v) ? v : []);

export default function CommandPalette() {
  const { open, closePalette } = useCommandPalette();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const profile = useProfile();
  const navLinks = useNavLinks();

  const uid = useId();
  const listId = `${uid}-list`;
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const previouslyFocused = useRef(null);
  const requestId = useRef(0);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState({ projects: [], posts: [], loading: false });
  const debounced = useDebouncedValue(query.trim(), 250);

  const go = useCallback((to) => {
    closePalette();
    navigate(to);
  }, [closePalette, navigate]);

  // Reset on open; remember what had focus so we can give it back.
  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    setQuery('');
    setActive(0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Defaults (empty query): featured projects + latest posts, fetched once.
  useEffect(() => {
    if (!open || defaultsCache) {
      if (open && defaultsCache) setRemote({ ...defaultsCache, loading: false });
      return;
    }
    let live = true;
    setRemote((r) => ({ ...r, loading: true }));
    Promise.all([
      PortfolioAPI.getFeaturedProjects(4),
      PortfolioAPI.getPosts({ page: 1, limit: 3 }),
    ]).then(([p, b]) => {
      defaultsCache = { projects: asList(p.data), posts: asList(b.data) };
      if (live) setRemote({ ...defaultsCache, loading: false });
    }).catch(() => { if (live) setRemote({ projects: [], posts: [], loading: false }); });
    return () => { live = false; };
  }, [open]);

  // Live search through the existing /search API.
  useEffect(() => {
    if (!open || debounced.length < 2) {
      if (open && defaultsCache) setRemote({ ...defaultsCache, loading: false });
      return;
    }
    const id = ++requestId.current;
    setRemote((r) => ({ ...r, loading: true }));
    PortfolioAPI.search({ q: debounced, type: 'all', limit: 8 }).then(({ data }) => {
      if (id !== requestId.current) return; // a newer query superseded this one
      const items = asList(data);
      setRemote({
        projects: items.filter((i) => i.resultType === 'project'),
        posts: items.filter((i) => i.resultType === 'blog'),
        loading: false,
      });
    }).catch(() => {
      if (id === requestId.current) setRemote({ projects: [], posts: [], loading: false });
    });
  }, [debounced, open]);

  const needle = query.trim().toLowerCase();
  const typing = needle.length >= 2;

  const groups = useMemo(() => {
    const match = (s) => !needle || s.toLowerCase().includes(needle);
    const out = [];

    const pages = [{ label: 'Home', to: '/' }, ...navLinks.map((l) => ({ label: l.label, to: l.href })), { label: 'Search page', to: '/search' }]
      .filter((p) => match(p.label))
      .map((p) => ({
        id: `page-${p.to}`, label: p.label, hint: p.to, icon: ArrowRight, run: () => go(p.to),
      }));
    if (pages.length) out.push({ name: 'Pages', items: pages });

    const projects = remote.projects.slice(0, 5).map((p) => ({
      id: `project-${p.slug}`, label: p.title, hint: p.category || 'Project', icon: Folder, run: () => go(`/projects/${p.slug}`),
    }));
    if (projects.length) out.push({ name: 'Projects', items: projects });

    const posts = remote.posts.slice(0, 4).map((p) => ({
      id: `post-${p.slug}`, label: p.title, hint: 'Writing', icon: FileText, run: () => go(`/blog/${p.slug}`),
    }));
    if (posts.length) out.push({ name: 'Writing', items: posts });

    const actions = [
      {
        id: 'act-theme',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
        hint: 'Theme',
        icon: theme === 'dark' ? Sun : Moon,
        run: () => { toggle(); closePalette(); },
      },
    ];
    if (profile?.email) {
      actions.push({
        id: 'act-email',
        label: 'Copy email address',
        hint: profile.email,
        icon: Copy,
        run: async () => {
          const ok = await copyText(profile.email);
          closePalette();
          if (ok) toast.success('Email address copied.');
          else toast.error('Couldn’t copy. The address is in the footer.');
        },
      });
      actions.push({
        id: 'act-start',
        label: 'Start a project (send an email)',
        hint: 'Email',
        icon: Mail,
        run: () => { closePalette(); window.location.href = `mailto:${profile.email}`; },
      });
    }
    const keyed = actions.filter((a) => match(`${a.label} ${a.hint}`));
    if (keyed.length) out.push({ name: 'Actions', items: keyed });

    if (typing) {
      out.push({
        name: 'Search',
        items: [{
          id: 'search-all', label: `See all results for “${query.trim()}”`, hint: '/search', icon: SearchIcon,
          run: () => go(`/search?q=${encodeURIComponent(query.trim())}`),
        }],
      });
    }
    return out;
  }, [needle, typing, query, navLinks, remote, theme, toggle, profile, toast, go, closePalette]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // Keep the highlighted row valid and visible.
  useEffect(() => { setActive(0); }, [needle, remote.projects, remote.posts]);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, flat]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closePalette(); return; }
    if (e.key === 'Tab') {
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      if (items.length <= 1) { e.preventDefault(); inputRef.current?.focus(); }
      return;
    }
    if (!flat.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % flat.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + flat.length) % flat.length); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(flat.length - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); flat[active]?.run(); }
  };

  const activeId = flat[active] ? `${uid}-${flat[active].id}` : undefined;
  let rowIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-3 pt-[10vh] sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
        >
          <div className="absolute inset-0 bg-scrim/60" onClick={closePalette} aria-hidden="true" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search and commands"
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="glass relative w-full max-w-xl overflow-hidden rounded-3xl shadow-overlay"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <SearchIcon size={18} className="shrink-0 text-muted" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                aria-label="Search pages, projects and posts"
                placeholder="Search pages, projects, writing…"
                autoComplete="off"
                spellCheck={false}
                className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
              />
            </div>

            <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="max-h-[min(52vh,26rem)] overflow-y-auto p-2">
              {groups.map((group) => (
                <div key={group.name} role="group" aria-label={group.name} className="pb-1">
                  <p aria-hidden="true" className="section-label px-3 pb-1 pt-3">{group.name}</p>
                  {group.items.map((item) => {
                    rowIndex += 1;
                    const idx = rowIndex;
                    const isActive = idx === active;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        id={`${uid}-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseMove={() => { if (!isActive) setActive(idx); }}
                        onClick={item.run}
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 transition-colors duration-fast ${isActive ? 'bg-ink/10 text-ink' : 'text-ink'}`}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted">
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span>
                        <span className="hidden max-w-[40%] truncate text-xs text-muted sm:inline">{item.hint}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {!flat.length && (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  {remote.loading ? 'Searching…' : `Nothing found for “${query.trim()}”.`}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5 text-xs text-muted">
              <span />
              <span aria-live="polite">{remote.loading ? 'Searching…' : `${flat.length} result${flat.length === 1 ? '' : 's'}`}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

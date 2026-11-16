import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search as SearchIcon, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Buttons';
import { useNavLinks } from '@/hooks/useNavLinks';
import { useProfile } from '@/hooks/useProfile';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useCommandPalette } from '@/hooks/useCommandPalette';

/**
 * Floating glass navbar (glass is allowed only here and in the command palette).
 *  - shrinks after 24 px of scroll (height + width; the page offset does NOT
 *    change, so there is no layout shift)
 *  - sliding active-link indicator (framer-motion layoutId; instant under
 *    prefers-reduced-motion thanks to <MotionConfig reducedMotion="user">)
 *  - theme toggle + Cmd/Ctrl+K button
 *  - mobile: full-screen menu with staggered links, focus trap, Escape, scroll lock
 */

// Page offset: 12 px gap above the bar + 64 px bar + 4 px breathing room.
// Pages read it as `var(--navbar-h)`; it is fixed so shrinking never moves content.
const NAV_OFFSET = '80px';
const EASE = [0.22, 1, 0.36, 1];
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const links = useNavLinks();
  const profile = useProfile();
  const settings = useSiteSettings();
  const { openPalette } = useCommandPalette();

  const headerRef = useRef(null);
  const overlayRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const name = profile?.full_name || settings?.site_title || 'Portfolio';
  const startHref = profile?.email ? `mailto:${profile.email}` : '/contact';

  useEffect(() => {
    document.documentElement.style.setProperty('--navbar-h', NAV_OFFSET);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) menuButtonRef.current?.focus();
  }, []);

  // Navigating closes the menu (focus is handled by ScrollToTop, not restored here).
  useEffect(() => { setOpen(false); }, [pathname]);

  // The mobile menu only exists below md: close it if the window is widened.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Open menu: lock page scroll, Escape closes, Tab stays inside header + overlay.
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlayRef.current?.querySelector('a[href]')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { closeMenu(true); return; }
      if (e.key !== 'Tab') return;
      const items = [
        ...headerRef.current.querySelectorAll(FOCUSABLE),
        ...overlayRef.current.querySelectorAll(FOCUSABLE),
      ].filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, closeMenu]);

  return (
    <>
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 pt-3 pointer-events-none">
        <div className="container-page">
          <nav
            aria-label="Primary"
            className={`pointer-events-auto glass mx-auto flex items-center justify-between gap-2 rounded-full pl-2 pr-2 md:pl-3
              transition-[height,max-width] duration-slow ease-standard
              ${scrolled ? 'h-12 max-w-4xl' : 'h-16 max-w-5xl'}`}
          >
            <Link
              to="/"
              aria-label={`${name} — home`}
              className="flex min-h-11 min-w-0 shrink items-center gap-2.5 rounded-full pr-2 text-ink"
            >
              <span className="truncate font-display text-lg leading-none tracking-tight">{name}</span>
            </Link>

            <ul className="hidden shrink-0 items-center gap-0.5 md:flex">
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink
                    to={link.href}
                    className={({ isActive }) =>
                      `relative inline-flex min-h-11 items-center rounded-full px-4 text-sm transition-colors duration-fast ${
                        isActive ? 'text-ink font-medium' : 'text-muted hover:text-ink'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full bg-ink/10"
                            transition={{ duration: 0.3, ease: EASE }}
                          />
                        )}
                        <span className="relative">{link.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={openPalette}
                aria-label="Search and commands"
                aria-haspopup="dialog"
                aria-keyshortcuts="Control+K Meta+K"
                className="hidden h-11 w-11 items-center justify-center rounded-full text-muted transition-colors duration-fast hover:text-ink md:inline-flex"
              >
                <SearchIcon size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={openPalette}
                aria-label="Search and commands"
                aria-haspopup="dialog"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors duration-fast hover:text-ink md:hidden"
              >
                <SearchIcon size={18} aria-hidden="true" />
              </button>
              <ThemeToggle />
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => (open ? closeMenu(true) : setOpen(true))}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="mobile-nav-menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink md:hidden"
              >
                {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 overflow-y-auto bg-bg md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="container-page flex min-h-full flex-col justify-between pb-10 pt-28">
              <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-1">
                {links.map((link) => (
                  <motion.li key={link.href} variants={itemVariants}>
                    <NavLink
                      to={link.href}
                      className={({ isActive }) =>
                        `group flex min-h-14 items-baseline gap-4 border-b border-line py-3 ${
                          isActive ? 'text-ink' : 'text-muted hover:text-ink'
                        }`
                      }
                    >
                      <span className="font-display text-5xl leading-none tracking-tight">{link.label}</span>
                    </NavLink>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + links.length * 0.06, duration: 0.45, ease: EASE } }}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <Button href={startHref} size="lg">Start a project</Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

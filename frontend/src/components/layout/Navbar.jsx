import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Search as SearchIcon } from 'lucide-react';
import { usePostCount } from '@/hooks/usePostCount';

// Primary navigation (5 items). Writing stays hidden until there are at
// least MIN_POSTS published posts.
const MIN_POSTS = 3;
const BASE_LINKS = [
  { href: '/projects', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Writing', needsPosts: true },
  { href: '/resume', label: 'Resume' },
  { href: '/contact', label: 'Contact' },
];

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm rounded border-b-2 transition-colors ${
    isActive
      ? 'text-ink font-medium border-accent'
      : 'text-muted border-transparent hover:text-ink'
  }`;

export default function Navbar() {
  const { pathname } = useLocation();
  const headerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const postCount = usePostCount();

  const links = BASE_LINKS.filter((l) => !l.needsPosts || (postCount ?? 0) >= MIN_POSTS);

  // Publish the real header height so pages can pad against it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const setVar = () => {
      document.documentElement.style.setProperty('--navbar-h', `${el.offsetHeight}px`);
    };
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 inset-x-0 z-50 bg-bg border-b border-line"
    >
      <div className="container-page">
        <nav aria-label="Primary" className="flex items-center justify-between h-16">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight text-ink">
            Gerry&apos;s Portfolio
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink key={link.href} to={link.href} end={link.href === '/'} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/search"
              aria-label="Search"
              className="ml-2 p-2 rounded text-muted hover:text-ink transition-colors"
            >
              <SearchIcon size={18} />
            </Link>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <Link to="/search" aria-label="Search" className="p-2 rounded text-muted hover:text-ink">
              <SearchIcon size={20} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="p-2 rounded text-ink"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-nav-menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <nav
          id="mobile-nav-menu"
          aria-label="Mobile"
          className="md:hidden border-t border-line bg-bg"
        >
          <div className="container-page flex flex-col py-2">
            {links.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `py-3 text-base border-l-2 pl-3 ${
                    isActive ? 'text-ink font-medium border-accent' : 'text-muted border-transparent'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

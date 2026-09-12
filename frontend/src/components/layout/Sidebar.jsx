import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, Newspaper, Settings, LogOut, User, Award, Trophy, BarChart3, Briefcase, Menu, X } from 'lucide-react';
import { PortfolioAPI } from '@/services/api';

const NAV = [
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/skills', label: 'Skills', icon: BarChart3 },
  { href: '/admin/experience', label: 'Experience', icon: Briefcase },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/achievements', label: 'Achievements', icon: Trophy },
  { href: '/admin/setting', label: 'Settings', icon: Settings },
];

function NavLinks({ pathname, onNavigate }) {
  return (
    <>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            to={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
              active
                ? 'bg-gradient-to-r from-accent/25 to-cyan-accent/10 text-accent-dark font-medium border border-accent/30'
                : 'text-ink/60 hover:text-ink hover:bg-ink/5 border border-transparent'
            }`}
          >
            <Icon size={16} className={active ? 'text-accent-dark' : ''} />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await PortfolioAPI.logout();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('portfolio_token');
      window.localStorage.removeItem('portfolio_csrf');
    }
    navigate('/admin/login');
  };

  return (
    <aside className="w-full md:w-64 shrink-0 md:h-[calc(100vh-2rem)] md:sticky md:top-4">
      <div className="glass rounded-2xl p-4 h-full flex flex-col">
        {/* Mobile: compact top bar (logo + hamburger + logout) that opens a
            proper drawer below it, instead of a horizontally-scrolling nav
            that only ever showed a couple of items at a time. Desktop
            (md+) is unchanged — full stacked sidebar. */}
        <div className="w-full flex items-center justify-between gap-2 md:block">
          <div className="flex items-center gap-2.5 px-2 pb-0 md:pb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-cyan-accent flex items-center justify-center shrink-0">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold">Admin Panel</span>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle admin menu"
              aria-expanded={open}
              aria-controls="admin-mobile-nav"
              className="flex items-center justify-center p-2.5 rounded-xl text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors shrink-0"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="flex items-center justify-center p-2.5 rounded-xl text-ink/60 hover:text-red-400 hover:bg-red-500/5 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <motion.nav
              id="admin-mobile-nav"
              aria-label="Admin"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden overflow-hidden mt-2"
            >
              <div className="flex flex-col gap-1 pt-2 border-t border-ink/10">
                <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Desktop sidebar nav */}
        <nav aria-label="Admin" className="hidden md:flex md:flex-col gap-1">
          <NavLinks pathname={pathname} />
        </nav>

        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink/60 hover:text-red-400 hover:bg-red-500/5 transition-colors shrink-0 mt-4"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Newspaper, Settings, LogOut, User, Award, Trophy, BarChart3 } from 'lucide-react';
import { PortfolioAPI } from '@/services/api';

const NAV = [
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/skills', label: 'Skills', icon: BarChart3 },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/achievements', label: 'Achievements', icon: Trophy },
  { href: '/admin/setting', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await PortfolioAPI.logout();
    if (typeof window !== 'undefined') window.localStorage.removeItem('portfolio_token');
    router.push('/admin/login');
  };

  return (
    <aside className="w-full md:w-64 shrink-0 md:h-[calc(100vh-2rem)] md:sticky md:top-4">
      <div className="glass rounded-2xl p-4 h-full flex md:flex-col justify-between">
        <div className="w-full">
          <div className="flex items-center gap-2.5 px-2 pb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-cyan-accent flex items-center justify-center shrink-0">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold">Admin Panel</span>
          </div>
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-gradient-to-r from-accent/25 to-cyan-accent/10 text-white border border-accent/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-accent-light' : ''} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-red-400 hover:bg-red-500/5 transition-colors shrink-0"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

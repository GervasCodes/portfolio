'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Newspaper, Settings, LogOut, User, Award, Trophy } from 'lucide-react';
import { PortfolioAPI } from '@/services/api';

const NAV = [
  { href: '/admin/profile', label: 'Profile', icon: User },
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
        <div>
          <div className="flex items-center gap-2 px-2 pb-6">
            <LayoutDashboard size={20} className="text-accent-light" />
            <span className="font-display font-semibold">Admin Panel</span>
          </div>
          <nav className="flex md:flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

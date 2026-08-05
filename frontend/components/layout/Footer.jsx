import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-white/10">
      <div className="container-page py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-display text-lg">
            <span className="text-gradient">Portfolio</span>
            <span className="text-white/40">.dev</span>
          </p>
          <p className="text-sm text-white/40 mt-1">© {year} All rights reserved.</p>
        </div>

        <div className="flex items-center gap-4">
          <SocialLink href="https://github.com" icon={<Github size={18} />} label="GitHub" />
          <SocialLink href="https://linkedin.com" icon={<Linkedin size={18} />} label="LinkedIn" />
          <SocialLink href="https://twitter.com" icon={<Twitter size={18} />} label="Twitter" />
          <SocialLink href="mailto:you@example.com" icon={<Mail size={18} />} label="Email" />
        </div>

        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/contacts" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/admin/login" className="hover:text-white transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="glass glass-hover w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white"
    >
      {icon}
    </a>
  );
}

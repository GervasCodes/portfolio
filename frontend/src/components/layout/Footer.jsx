import { Link } from 'react-router-dom';
import { Github, Linkedin, Instagram, MessageCircle, Mail, ArrowUp } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-32 border-t border-white/10">
      <div className="container-page py-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <p className="font-display text-lg">
            <span className="text-gradient">GERRY&apos;S</span>
            <span className="text-white/40">Portfolio</span>
          </p>
          <p className="text-sm text-white/40 mt-1">© {year} All rights reserved.</p>
        </div>

        <div className="flex items-center gap-3">
          <SocialLink href="https://github.com" icon={<Github size={18} />} label="GitHub" />
          <SocialLink href="https://linkedin.com" icon={<Linkedin size={18} />} label="LinkedIn" />
          <SocialLink href="https://instagram.com" icon={<Instagram size={18} />} label="Instagram" />
          <SocialLink href="https://wa.me/000000000000" icon={<MessageCircle size={18} />} label="WhatsApp" />
          <SocialLink href="mailto:amgerryofficial@gmail.com" icon={<Mail size={18} />} label="Email" />
        </div>

        <div className="flex items-center gap-6 text-sm text-white/50">
          <Link to="/contacts" className="hover:text-white transition-colors">Contact</Link>
          <Link to="/admin/login" className="hover:text-white transition-colors">Admin</Link>
          <button
            onClick={scrollTop}
            aria-label="Back to top"
            className="glass glass-hover w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white"
          >
            <ArrowUp size={15} />
          </button>
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

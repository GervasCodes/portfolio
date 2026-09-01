import { Link } from 'react-router-dom';
import { Github, Linkedin, Instagram, MessageCircle, Mail, ArrowUp } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

// Real values used only as a fallback for the brief window before the
// profile finishes loading (or if a field hasn't been set in Admin →
// Profile yet) — the source of truth is always the CMS from here on.
//
// TODO: github_url and linkedin_url below are still generic placeholders —
// replace with the real profile URLs (or, better, just fill them in via
// Admin -> Profile so this fallback is never actually hit in production).
const FALLBACK = {
  github_url: 'https://github.com/', // TODO: replace with real GitHub profile URL
  linkedin_url: 'https://linkedin.com/', // TODO: replace with real LinkedIn profile URL
  instagram_url: 'https://www.instagram.com/tc_gerry/',
  whatsapp_number: '255622387905',
  email: 'amgerryofficial@gmail.com',
};

/** Turns a stored phone number into a wa.me link, tolerating spaces/dashes/+. */
function toWhatsAppUrl(number) {
  const digits = String(number || '').replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export default function Footer() {
  const profile = useProfile();
  const year = new Date().getFullYear();

  const github = profile?.github_url || FALLBACK.github_url;
  const linkedin = profile?.linkedin_url || FALLBACK.linkedin_url;
  const instagram = profile?.instagram_url || FALLBACK.instagram_url;
  const whatsapp = toWhatsAppUrl(profile?.whatsapp_number) || toWhatsAppUrl(FALLBACK.whatsapp_number);
  const email = profile?.email || FALLBACK.email;

  const scrollTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-32 border-t border-white/10">
      <div className="container-page py-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <p className="font-display text-lg">
            <span className="text-gradient">GERRY&apos;S</span>
            <span className="text-white/50">Portfolio</span>
          </p>
          <p className="text-sm text-white/50 mt-1">© {year} All rights reserved.</p>
        </div>

        <div className="flex items-center gap-3">
          <SocialLink href={github} icon={<Github size={18} />} label="GitHub" />
          <SocialLink href={linkedin} icon={<Linkedin size={18} />} label="LinkedIn" />
          <SocialLink href={instagram} icon={<Instagram size={18} />} label="Instagram" />
          {whatsapp && <SocialLink href={whatsapp} icon={<MessageCircle size={18} />} label="WhatsApp" />}
          <SocialLink href={`mailto:${email}`} icon={<Mail size={18} />} label="Email" />
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

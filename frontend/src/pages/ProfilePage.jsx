import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MapPin, Briefcase, Phone, Github, Linkedin, Instagram,
  Globe, MessageCircle, Download,
} from 'lucide-react';
import Button from '@/components/ui/Buttons';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile } from '@/utils/sampleData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

const LINKS = [
  { key: 'github_url', label: 'GitHub', icon: Github },
  { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin },
  { key: 'instagram_url', label: 'Instagram', icon: Instagram },
  { key: 'website_url', label: 'Website', icon: Globe },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(sampleProfile);

  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Profile', settings, profile?.full_name));

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getProfile();
      if (!mounted) return;
      setProfile(data || sampleProfile);
    })();
    return () => { mounted = false; };
  }, []);

  const whatsappHref = profile?.whatsapp_number
    ? `https://wa.me/${profile.whatsapp_number.replace(/[^\d]/g, '')}`
    : null;

  return (
    <div className="pt-28 pb-24">
      <div className="container-page max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 md:p-10"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative w-28 h-28 shrink-0 rounded-full p-[3px] bg-gradient-to-br from-accent to-cyan-accent shadow-glow">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-background bg-white/5 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile?.full_name || 'Profile photo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white/30 text-xs">No photo</span>
                )}
              </div>
            </div>

            <div>
              <p className="section-label">Profile</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {profile?.full_name || 'Your Name'}
              </h1>
              <p className="text-white/60 mt-1">{profile?.title}</p>
              {profile?.available_for_work && (
                <span className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-xs glass text-white/70">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  Available for new opportunities
                </span>
              )}
            </div>
          </div>

          {profile?.bio && (
            <p className="text-white/60 leading-relaxed mt-8">{profile.bio}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mt-8 text-sm">
            {profile?.location && (
              <div className="flex items-center gap-3 text-white/70">
                <MapPin size={16} className="text-accent-light shrink-0" /> {profile.location}
              </div>
            )}
            {profile?.title && (
              <div className="flex items-center gap-3 text-white/70">
                <Briefcase size={16} className="text-accent-light shrink-0" /> {profile.title}
              </div>
            )}
            {profile?.email && (
              <div className="flex items-center gap-3 text-white/70">
                <Mail size={16} className="text-accent-light shrink-0" /> {profile.email}
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-center gap-3 text-white/70">
                <Phone size={16} className="text-accent-light shrink-0" /> {profile.phone}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            {LINKS.filter((l) => profile?.[l.key]).map(({ key, label, icon: Icon }) => (
              <a
                key={key}
                href={profile[key]}
                target="_blank"
                rel="noreferrer"
                className="glass glass-hover rounded-xl px-4 py-2 text-sm inline-flex items-center gap-2 text-white/70 hover:text-white"
              >
                <Icon size={14} /> {label}
              </a>
            ))}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="glass glass-hover rounded-xl px-4 py-2 text-sm inline-flex items-center gap-2 text-white/70 hover:text-white"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
          </div>

          {profile?.resume_url && (
            <div className="mt-8">
              <Button href={profile.resume_url} icon={<Download size={16} />}>
                Download Resume
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

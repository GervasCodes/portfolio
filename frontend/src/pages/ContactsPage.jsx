import { useEffect, useState } from 'react';
import Contacts from '@/components/sections/Contacts';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

// The form works even if the profile request fails (the side column just
// shows less), so this page never blocks on it.
export default function ContactsPage() {
  const [profile, setProfile] = useState(null);
  const settings = useSiteSettings();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getProfile();
      if (mounted) setProfile(data || null);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <Seo
        title={buildTitle('Contact', settings, profile?.full_name)}
        description="Start a project or just say hello. Send a message, email or WhatsApp."
        path="/contact"
        siteName={settings?.site_title || profile?.full_name}
      />
      <Contacts profile={profile} />
    </div>
  );
}

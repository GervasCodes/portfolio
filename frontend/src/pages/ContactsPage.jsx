import { useEffect, useState } from 'react';
import Contacts from '@/components/sections/Contacts';
import { PortfolioAPI } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

export default function ContactsPage() {
  const [profile, setProfile] = useState(null);
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Contact', settings, profile?.full_name));

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getProfile();
      if (mounted) setProfile(data || null);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pb-8" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <Contacts profile={profile} />
    </div>
  );
}

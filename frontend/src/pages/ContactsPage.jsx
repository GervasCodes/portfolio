import { useEffect, useState } from 'react';
import Contacts from '@/components/sections/Contacts';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile } from '@/utils/sampleData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

export default function ContactsPage() {
  const [profile, setProfile] = useState(sampleProfile);
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Contact', settings, profile?.full_name));

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getProfile();
      if (!mounted) return;
      setProfile(data || sampleProfile);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pt-28">
      <Contacts profile={profile} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import About from '@/components/sections/About';
import CertificatesAchievements from '@/components/sections/CertificatesAchievements';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile } from '@/utils/sampleData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

export default function AboutPage() {
  const [profile, setProfile] = useState(sampleProfile);
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('About', settings, profile?.full_name));
  const [certs, setCerts] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [profileRes, certsRes, achievementsRes] = await Promise.all([
        PortfolioAPI.getProfile(),
        PortfolioAPI.getCertificates(),
        PortfolioAPI.getAchievements(),
      ]);
      if (!mounted) return;

      setProfile(profileRes.data || sampleProfile);
      setCerts(certsRes.data || []);
      setAchievements(achievementsRes.data || []);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pt-28">
      <About profile={profile} />
      <CertificatesAchievements certificates={certs} achievements={achievements} />
    </div>
  );
}

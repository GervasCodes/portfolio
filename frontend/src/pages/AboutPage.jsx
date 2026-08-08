import { useEffect, useState } from 'react';
import About from '@/components/sections/About';
import CertificatesAchievements from '@/components/sections/CertificatesAchievements';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { sampleProfile } from '@/utils/sampleData';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { absoluteUrl, truncate, resolveImage } from '@/utils/seo';

export default function AboutPage() {
  const [profile, setProfile] = useState(sampleProfile);
  const settings = useSiteSettings();
  const pageTitle = buildTitle('About', settings, profile?.full_name);
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

  const description = truncate(profile?.bio || profile?.tagline || '');
  const image = resolveImage(profile?.avatar_url);
  const sameAs = [profile?.github_url, profile?.linkedin_url, profile?.twitter_url, profile?.instagram_url, profile?.website_url]
    .filter(Boolean);
  const structuredData = profile?.full_name
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.full_name,
        jobTitle: profile.title || undefined,
        description: description || undefined,
        url: absoluteUrl('/about'),
        ...(image ? { image } : {}),
        ...(profile.email ? { email: profile.email } : {}),
        ...(profile.location ? { address: profile.location } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      }
    : undefined;

  return (
    <div className="pt-28">
      <Seo
        title={pageTitle}
        description={description}
        path="/about"
        image={image}
        siteName={settings?.site_title || profile?.full_name}
        structuredData={structuredData}
      />
      <About profile={profile} />
      <CertificatesAchievements certificates={certs} achievements={achievements} />
    </div>
  );
}

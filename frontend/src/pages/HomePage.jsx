import { useEffect, useState } from 'react';
import Hero from '@/components/sections/Hero';
import { HeroSkeleton } from '@/components/sections/HomeSkeletons';
import { SelectedWork, AboutSnippet, LatestWriting, ContactCta } from '@/components/sections/HomeSections';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { truncate, resolveImage } from '@/utils/seo';

// Home has five sections (see docs/rebuild/01-ia-and-content.md):
// hero, selected work, about, recent writing, contact. Sections with no
// data are omitted; there are no sample-data fallbacks, so nothing on this
// page is invented.
export default function HomePage() {
  const [data, setData] = useState({ profile: null, projects: [], posts: [] });
  const [loading, setLoading] = useState(true);

  const settings = useSiteSettings();
  const { profile } = data;
  const siteTitle =
    settings?.site_title ||
    (profile?.full_name && profile?.title ? `${profile.full_name} — ${profile.title}` : 'Portfolio');
  const description = truncate(
    settings?.site_description || profile?.tagline || profile?.bio || 'Portfolio and case studies.'
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [profileRes, projectsRes, postsRes] = await Promise.all([
        PortfolioAPI.getProfile(),
        PortfolioAPI.getFeaturedProjects(3),
        PortfolioAPI.getPosts({ page: 1, limit: 3 }),
      ]);
      if (!mounted) return;
      setData({
        profile: profileRes.data || null,
        projects: (projectsRes.data || []).slice(0, 3),
        posts: (postsRes.data || []).slice(0, 3),
      });
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Seo
        title={siteTitle}
        description={description}
        path="/"
        image={resolveImage(profile?.avatar_url)}
        siteName={settings?.site_title || profile?.full_name}
      />
      {loading ? (
        <HeroSkeleton />
      ) : (
        <>
          <Hero profile={profile} />
          <SelectedWork projects={data.projects} />
          <AboutSnippet profile={profile} />
          <LatestWriting posts={data.posts} />
          <ContactCta profile={profile} />
        </>
      )}
    </>
  );
}

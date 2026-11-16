import { useEffect, useMemo, useState } from 'react';
import Hero from '@/components/sections/Hero';
import { HeroSkeleton, BelowFoldSkeleton } from '@/components/sections/HomeSkeletons';
import {
  ToolsMarquee, SelectedWork, WhatIDo, HowIWork,
  ExperienceSnapshot, Recognition, LatestWriting, ClosingCta,
} from '@/components/sections/HomeSections';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { useProfile } from '@/hooks/useProfile';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { truncate, resolveImage } from '@/utils/seo';
import {
  flattenSkills, topCategories, getProcessSteps, hasAdminSession, latestWork, recognitionItems,
} from '@/utils/homeContent';

// Home (Phase 3): hero -> tools marquee -> selected work -> what I do ->
// how I work -> experience -> recognition -> latest writing -> closing CTA.
// Everything shown comes from the CMS. A section with nothing to show either
// renders a designed empty state (work, what I do, experience) or is left out
// (process, recognition, writing). Nothing is sampled or invented.
//
// Loading: the hero needs only the profile, so it renders as soon as that
// arrives. Everything under it loads in parallel and appears together, behind
// one skeleton, so content below the fold never shifts piece by piece.
export default function HomePage() {
  const profile = useProfile(); // shared cache with the footer: one /profile request
  const settings = useSiteSettings();
  const [below, setBelow] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [projects, posts, skills, work, certificates, achievements] = await Promise.all([
        PortfolioAPI.getFeaturedProjects(4),
        PortfolioAPI.getPosts({ page: 1, limit: 3 }),
        PortfolioAPI.getSkills(),
        PortfolioAPI.getExperience('work'),
        PortfolioAPI.getCertificates(),
        PortfolioAPI.getAchievements(),
      ]);
      if (!mounted) return;
      setBelow({
        projects: (projects.data || []).slice(0, 4),
        posts: (posts.data || []).slice(0, 3),
        skills: skills.data || {},
        work: work.data || [],
        certificates: certificates.data || [],
        achievements: achievements.data || [],
      });
    })();
    return () => { mounted = false; };
  }, []);

  const loadingHero = profile === null;
  const siteTitle =
    settings?.site_title ||
    (profile?.full_name && profile?.title ? `${profile.full_name} — ${profile.title}` : 'Portfolio');
  const description = truncate(
    settings?.site_description || profile?.tagline || profile?.bio || 'Portfolio and case studies.'
  );

  const view = useMemo(() => {
    if (!below) return null;
    const steps = getProcessSteps(settings);
    const ownerPlaceholders = hasAdminSession();
    const sections = {
      skills: flattenSkills(below.skills),
      categories: topCategories(below.skills, 3),
      steps,
      ownerPlaceholders,
      work: latestWork(below.work, 3),
      recognition: recognitionItems(below.certificates, below.achievements, 8),
    };
    // Numbers count only the sections that are actually shown, in order.
    let n = 0;
    const next = () => String(++n).padStart(2, '0');
    sections.numbers = {
      work: next(),
      what: next(),
      how: steps.length || ownerPlaceholders ? next() : null,
      exp: next(),
      rec: sections.recognition.length ? next() : null,
      writing: below.posts.length ? next() : null,
    };
    return sections;
  }, [below, settings]);

  return (
    <>
      <Seo
        title={siteTitle}
        description={description}
        path="/"
        image={resolveImage(profile?.avatar_url)}
        siteName={settings?.site_title || profile?.full_name}
      />
      {loadingHero ? (
        <HeroSkeleton />
      ) : (
        <Hero profile={profile} siteTitle={settings?.site_title} />
      )}
      {!view ? (
        <BelowFoldSkeleton />
      ) : (
        <>
          <ToolsMarquee skills={view.skills} />
          <SelectedWork projects={below.projects} number={view.numbers.work} />
          <WhatIDo categories={view.categories} number={view.numbers.what} />
          <HowIWork steps={view.steps} ownerPlaceholders={view.ownerPlaceholders} number={view.numbers.how} />
          <ExperienceSnapshot items={view.work} number={view.numbers.exp} />
          <Recognition items={view.recognition} number={view.numbers.rec} />
          <LatestWriting posts={below.posts} number={view.numbers.writing} />
          <ClosingCta profile={profile} />
        </>
      )}
    </>
  );
}

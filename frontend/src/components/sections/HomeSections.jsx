import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProjectList from '@/components/projects/ProjectList';
import TextLink from '@/components/ui/TextLink';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Buttons';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }) : '';

/** Section 2: up to three featured projects as plain rows, not a card grid. */
export function SelectedWork({ projects }) {
  if (!projects?.length) return null;
  return (
    <section className="py-16 border-t border-line">
      <div className="container-page">
        <SectionHeader eyebrow="Work" title="Selected work" />
        <ProjectList projects={projects} />
        <p className="mt-6"><TextLink href="/projects">All projects</TextLink></p>
      </div>
    </section>
  );
}

/** Section 3: the profile bio, trimmed. Shown only when a bio exists. */
export function AboutSnippet({ profile }) {
  const bio = profile?.bio?.trim();
  if (!bio) return null;
  const short = bio.length > 320 ? `${bio.slice(0, 320).replace(/\s+\S*$/, '')}…` : bio;
  return (
    <section className="py-16 border-t border-line">
      <div className="container-page grid gap-6 md:grid-cols-[1fr_2fr] md:gap-10">
        <SectionHeader as="h2" eyebrow="About" title="A little about me" className="mb-0" />
        <div>
          <p className="text-lg leading-relaxed max-w-prose">{short}</p>
          <p className="mt-4"><TextLink href="/about">More about me</TextLink></p>
        </div>
      </div>
    </section>
  );
}

/** Section 4: latest posts; rendered only when posts exist. */
export function LatestWriting({ posts }) {
  if (!posts?.length) return null;
  return (
    <section className="py-16 border-t border-line">
      <div className="container-page">
        <SectionHeader eyebrow="Writing" title="Recent writing" />
        <ul className="divide-y divide-line border-y border-line">
          {posts.map((post) => (
            <li key={post.id || post.slug}>
              <Link to={`/blog/${post.slug}`} className="group flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:justify-between">
                <span className="font-display text-lg group-hover:text-accent">{post.title}</span>
                <span className="text-sm text-muted">{formatDate(post.published_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6"><TextLink href="/blog">All posts</TextLink></p>
      </div>
    </section>
  );
}

/** Section 5: one clear action, no form (the form lives on /contact). */
export function ContactCta({ profile }) {
  const email = profile?.email;
  return (
    <section className="py-16 border-t border-line">
      <div className="container-page">
        <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight max-w-2xl">
          Have a project in mind?
        </h2>
        <p className="mt-4 text-muted max-w-prose">
          Tell me what you need and I will reply with how I would approach it.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Button href="/contact" size="lg" icon={<ArrowRight size={18} />}>Send a message</Button>
          {email && <TextLink href={`mailto:${email}`}>{email}</TextLink>}
        </div>
      </div>
    </section>
  );
}

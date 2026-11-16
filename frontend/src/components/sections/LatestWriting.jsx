import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import Button from '@/components/ui/Buttons';
import Reveal from '@/components/ui/Reveal';
import PlaceholderArt from '@/components/ui/PlaceholderArt';
import { formatMonthYear } from '@/utils/homeContent';
import ProgressiveImage from '@/components/ui/ProgressiveImage';

/** Latest posts (up to 3). Rendered only when published posts exist. */
export default function LatestWriting({ posts = [], number }) {
  if (!posts.length) return null;
  return (
    <section className="py-section">
      <div className="container-page">
        <SectionHeader number={number} eyebrow="Writing" title={<>Latest <em>writing</em></>} />
        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post, i) => {
            const tags = Array.isArray(post.tags) ? post.tags.slice(0, 2) : [];
            return (
              <Reveal key={post.id || post.slug} delay={i * 80}>
                <Card as={Link} to={`/blog/${post.slug}`} interactive className="group flex h-full flex-col">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
                    {post.cover_image_url ? (
                      <ProgressiveImage
                        src={post.cover_image_url}
                        width="1280"
                        height="720"
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:transition-none"
                      />
                    ) : (
                      <PlaceholderArt seed={post.slug || post.title} className="absolute inset-0 h-full w-full" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                      {formatMonthYear(post.published_at)}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-normal leading-tight tracking-tight transition-colors duration-fast group-hover:text-accent">
                      {post.title}
                    </h3>
                    {post.excerpt && <p className="mt-3 line-clamp-3 text-muted">{post.excerpt}</p>}
                    {tags.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        {tags.map((t) => <Tag key={t}>{t}</Tag>)}
                      </div>
                    )}
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-10">
          <Button href="/blog" variant="secondary" icon={<ArrowRight size={16} aria-hidden="true" />}>
            All posts
          </Button>
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import PlaceholderArt from '@/components/ui/PlaceholderArt';
import { formatLongDate, postTags, readingMinutes } from '@/utils/blogContent';
import ProgressiveImage from '@/components/ui/ProgressiveImage';

/**
 * A post as a card. `featured` is the wide version for the latest post.
 * A post with no cover gets generated art from its slug, never a blank box.
 * Heading level is set by `as` so the page keeps a valid outline.
 */
export default function PostCard({ post, featured = false, as: Heading = 'h2' }) {
  const tags = postTags(post).slice(0, featured ? 4 : 2);
  const minutes = readingMinutes(post.content);
  const date = formatLongDate(post.published_at);
  const meta = [date, minutes ? `${minutes} min read` : ''].filter(Boolean).join(' · ');

  return (
    <Card
      as={Link}
      to={`/blog/${post.slug}`}
      interactive
      className={`group flex h-full flex-col ${featured ? 'lg:grid lg:grid-cols-12' : ''}`}
    >
      <div className={`relative aspect-[16/9] w-full overflow-hidden bg-surface-2 ${featured ? 'lg:col-span-7 lg:aspect-auto lg:min-h-[22rem]' : ''}`}>
        {post.cover_image_url ? (
          <ProgressiveImage
            src={post.cover_image_url}
            width="1280"
            height="720"
            priority={featured}
            sizes={featured ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <PlaceholderArt seed={post.slug || post.title} className="absolute inset-0 h-full w-full" />
        )}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? 'lg:col-span-5 lg:justify-center lg:p-10' : ''}`}>
        {meta && <p className="m-0 font-mono text-xs uppercase tracking-[0.12em] text-muted">{meta}</p>}
        <Heading
          className={`mt-3 font-display font-normal leading-tight tracking-tight transition-colors duration-fast group-hover:text-accent ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}
        >
          {post.title}
        </Heading>
        {post.excerpt && (
          <p className={`mt-3 text-muted ${featured ? 'line-clamp-4' : 'line-clamp-3'}`}>{post.excerpt}</p>
        )}
        {tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            {tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        )}
      </div>
    </Card>
  );
}

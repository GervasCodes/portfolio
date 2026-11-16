import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Markdown from '@/components/ui/Markdown';
import Seo from '@/components/seo/Seo';
import SectionHeader from '@/components/ui/SectionHeader';
import Skeleton from '@/components/ui/Skeleton';
import Tag from '@/components/ui/Tag';
import PostCard from '@/components/blog/PostCard';
import ReactionBar from '@/components/blog/ReactionBar';
import ShareBar from '@/components/blog/ShareBar';
import TableOfContents from '@/components/blog/TableOfContents';
import NewsletterSignup from '@/components/sections/NewsletterSignup';
import NotFoundPage from '@/pages/NotFoundPage';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { absoluteUrl, truncate, stripMarkdown, resolveImage } from '@/utils/seo';
import { formatLongDate, postTags, readingMinutes } from '@/utils/blogContent';
import ProgressiveImage from '@/components/ui/ProgressiveImage';

// Recognizes YouTube/Vimeo links and returns an embeddable iframe URL;
// returns null for anything else (a directly-uploaded video file, which
// renders with a plain <video> tag instead — see VideoEmbed below).
function toEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function VideoEmbed({ url }) {
  const embedUrl = toEmbedUrl(url);
  return (
    <div className="rounded-2xl overflow-hidden mb-8 aspect-video bg-ink/5">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Post video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video src={url} controls className="w-full h-full object-contain bg-scrim" />
      )}
    </div>
  );
}

function useRelatedPosts(post) {
  const [related, setRelated] = useState([]);
  const slug = post?.slug;
  const firstTag = postTags(post)[0];
  useEffect(() => {
    if (!slug) return undefined;
    let mounted = true;
    (async () => {
      const pick = (list) => (list || []).filter((p) => p.slug !== slug).slice(0, 3);
      let found = [];
      if (firstTag) found = pick((await PortfolioAPI.getPosts({ limit: 6, tag: firstTag })).data);
      if (!found.length) found = pick((await PortfolioAPI.getPosts({ limit: 4 })).data);
      if (mounted) setRelated(found);
    })();
    return () => { mounted = false; };
  }, [slug, firstTag]);
  return related;
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', post: null });
  const bodyRef = useRef(null);
  const settings = useSiteSettings();

  useEffect(() => {
    let mounted = true;
    setState({ status: 'loading', post: null });
    (async () => {
      const { data } = await PortfolioAPI.getPostBySlug(slug);
      if (!mounted) return;
      setState(data ? { status: 'ready', post: data } : { status: 'missing', post: null });
    })();
    return () => { mounted = false; };
  }, [slug]);

  const related = useRelatedPosts(state.post);

  if (state.status === 'missing') return <NotFoundPage />;
  if (state.status === 'loading') {
    return (
      <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
        <div className="container-page max-w-3xl space-y-4" aria-busy="true" aria-label="Loading post">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
        </div>
      </div>
    );
  }
  const { post } = state;
  const tags = postTags(post);
  const minutes = readingMinutes(post.content);
  const meta = [formatLongDate(post.published_at), minutes ? `${minutes} min read` : ''].filter(Boolean).join(' · ');
  const url = absoluteUrl(`/blog/${post.slug}`);

  const description = truncate(post.excerpt || stripMarkdown(post.content));
  const image = resolveImage(post.cover_image_url);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    url,
    ...(image ? { image } : {}),
    ...(post.published_at ? { datePublished: post.published_at, dateModified: post.published_at } : {}),
    ...(tags.length ? { keywords: tags.join(', ') } : {}),
    author: { '@type': 'Person', name: settings?.site_title || 'Author' },
  };

  return (
    <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <Seo
        title={buildTitle(post.title, settings)}
        description={description}
        path={`/blog/${post.slug}`}
        image={image}
        type="article"
        siteName={settings?.site_title}
        structuredData={structuredData}
      />
      <article className="container-page">
        <div className="mx-auto grid max-w-6xl gap-16 xl:grid-cols-[minmax(0,46rem)_15rem] xl:justify-center">
          <div className="min-w-0">
            <Link to="/blog" className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors duration-fast hover:text-ink">
              <ArrowLeft size={16} aria-hidden="true" /> All posts
            </Link>

            <header>
              {meta && <p className="m-0 font-mono text-xs uppercase tracking-[0.12em] text-muted">{meta}</p>}
              <h1 className="mt-4 text-balance font-display text-4xl font-normal leading-[1.02] tracking-tight md:text-6xl">{post.title}</h1>
              {post.excerpt && <p className="mt-6 max-w-measure text-xl leading-relaxed text-muted">{post.excerpt}</p>}
            </header>

            {post.cover_image_url && (
              <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-line bg-surface-2">
                <ProgressiveImage
                  src={post.cover_image_url}
                  width="1280"
                  height="720"
                  priority
                  sizes="(min-width: 1280px) 46rem, 100vw"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </div>
            )}

            <div className="mt-10">
              <TableOfContents containerRef={bodyRef} contentKey={post.slug} variant="inline" />
              {post.video_url && <VideoEmbed url={post.video_url} />}
              <div ref={bodyRef}>
                <Markdown>{post.content}</Markdown>
              </div>

              {post.link_url && (
                <a
                  href={post.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-accent underline underline-offset-4"
                >
                  <ExternalLink size={16} aria-hidden="true" /> Visit related link
                </a>
              )}
            </div>

            <footer className="mt-14 space-y-8 border-t border-line pt-8">
              {tags.length > 0 && (
                <ul className="m-0 flex list-none flex-wrap gap-x-2 p-0">
                  {tags.map((t) => (
                    <li key={t}>
                      <Link to={`/blog?tag=${encodeURIComponent(t)}`} className="inline-flex min-h-11 items-center" aria-label={`More posts tagged ${t}`}>
                        <Tag>{t}</Tag>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <ShareBar url={url} title={post.title} />
              <ReactionBar slug={post.slug} />
            </footer>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-[calc(var(--navbar-h)+2rem)]">
              <TableOfContents containerRef={bodyRef} contentKey={post.slug} />
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <div className="mt-24">
          <section aria-labelledby="related-title" className="container-page">
            <SectionHeader eyebrow="Keep reading" title={<span id="related-title">More <em>writing</em></span>} />
            <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <li key={p.id || p.slug}><PostCard post={p} as="h3" /></li>)}
            </ul>
          </section>
        </div>
      )}

      <div className="mt-20"><div className="container-page"><NewsletterSignup /></div></div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, Heart, Flame, PartyPopper, Lightbulb, ExternalLink } from 'lucide-react';
import Markdown from '@/components/ui/Markdown';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import Tag from '@/components/ui/Tag';
import Skeleton from '@/components/ui/Skeleton';
import NotFoundPage from '@/pages/NotFoundPage';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { absoluteUrl, truncate, stripMarkdown, resolveImage } from '@/utils/seo';

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
        <video src={url} controls className="w-full h-full object-contain bg-black" />
      )}
    </div>
  );
}

// Kept in sync with backend `ALLOWED_REACTIONS` (blogEngagement.service.js).
// Icon-based instead of emoji so reactions match the rest of the site's
// visual language instead of relying on native emoji glyphs.
const REACTIONS = [
  { id: 'like', label: 'Like', Icon: ThumbsUp },
  { id: 'love', label: 'Love', Icon: Heart },
  { id: 'fire', label: 'Fire', Icon: Flame },
  { id: 'celebrate', label: 'Celebrate', Icon: PartyPopper },
  { id: 'idea', label: 'Insightful', Icon: Lightbulb },
];

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ReactionBar({ slug }) {
  const [counts, setCounts] = useState({});
  const [mine, setMine] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getReactions(slug);
      if (!mounted || !data) return;
      setCounts(data.counts || {});
      setMine(data.mine || null);
    })();
    return () => { mounted = false; };
  }, [slug]);

  async function handleClick(reactionId) {
    if (busy) return;
    setBusy(true);
    const { data } = mine === reactionId
      ? await PortfolioAPI.removeReaction(slug)
      : await PortfolioAPI.setReaction(slug, reactionId);
    if (data) {
      setCounts(data.counts || {});
      setMine(data.mine ?? null);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-line">
      {REACTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleClick(id)}
          disabled={busy}
          aria-label={label}
          aria-pressed={mine === id}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors disabled:opacity-50 ${
            mine === id
              ? 'bg-accent/20 border-accent/50 text-accent'
              : 'bg-ink/5 border-ink/10 text-ink/60 hover:text-ink hover:bg-ink/10'
          }`}
        >
          <Icon size={15} />
          <span className="text-xs">{counts[id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', post: null });

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

  if (state.status === 'missing') return <NotFoundPage />;
  if (state.status === 'loading') {
    return (
      <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
        <div className="container-page max-w-3xl space-y-4"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-48 w-full" /></div>
      </div>
    );
  }
  const { post } = state;
  const pageTitle = buildTitle(post.title, settings);

  const description = truncate(post.excerpt || stripMarkdown(post.content));
  const image = resolveImage(post.cover_image_url);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    url: absoluteUrl(`/blog/${post.slug}`),
    ...(image ? { image } : {}),
    ...(post.published_at ? { datePublished: post.published_at, dateModified: post.published_at } : {}),
    ...(Array.isArray(post.tags) && post.tags.length ? { keywords: post.tags.join(', ') } : {}),
    author: { '@type': 'Person', name: settings?.site_title || 'Author' },
  };

  return (
    <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <Seo
        title={pageTitle}
        description={description}
        path={`/blog/${post.slug}`}
        image={image}
        type="article"
        siteName={settings?.site_title}
        structuredData={structuredData}
      />
      <div className="container-page max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-10">
          <ArrowLeft size={16} /> All posts
        </Link>

        <p className="text-sm text-muted mb-4">{formatDate(post.published_at)}</p>

        <h1 className="font-display text-4xl md:text-5xl font-normal leading-tight tracking-tight mb-8">{post.title}</h1>

        {post.cover_image_url && (
          <div className="rounded-md overflow-hidden border border-line mb-8">
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-ink/5">
              <img
                src={post.cover_image_url}
                alt=""
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          </div>
        )}

        {post.video_url && <VideoEmbed url={post.video_url} />}

        <Markdown>{post.content}</Markdown>

        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-8 text-sm text-accent underline underline-offset-4"
          >
            <ExternalLink size={16} /> Visit related link
          </a>
        )}

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-line">
            {post.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </div>
        )}

        <ReactionBar slug={post.slug} />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, ThumbsUp, Heart, Flame, PartyPopper, Lightbulb, ExternalLink } from 'lucide-react';
import Markdown from '@/components/ui/Markdown';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { sampleBlogPosts } from '@/utils/sampleData';
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
// glass/gradient visual language instead of relying on native emoji glyphs.
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
    <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-ink/10">
      {REACTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleClick(id)}
          disabled={busy}
          aria-label={label}
          aria-pressed={mine === id}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors disabled:opacity-50 ${
            mine === id
              ? 'bg-accent/20 border-accent/50 text-accent-dark'
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
  const fallback = sampleBlogPosts.find((p) => p.slug === slug) || sampleBlogPosts[0];
  const [post, setPost] = useState(fallback);

  const settings = useSiteSettings();
  const pageTitle = buildTitle(post ? post.title : 'Blog Post', settings);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getPostBySlug(slug);
      if (!mounted) return;
      setPost(data || sampleBlogPosts.find((p) => p.slug === slug) || sampleBlogPosts[0]);
    })();
    return () => { mounted = false; };
  }, [slug]);

  if (!post) return null;

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
    <div className="pt-28 pb-24">
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
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink mb-8">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <div className="flex items-center gap-4 text-xs text-ink/50 mb-4">
          <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.published_at)}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {post.views ?? 0} views</span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">{post.title}</h1>

        {post.cover_image_url && (
          <div className="rounded-2xl overflow-hidden mb-8">
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
            className="inline-flex items-center gap-2 mt-8 glass glass-hover rounded-xl px-4 py-2.5 text-sm text-accent-dark"
          >
            <ExternalLink size={16} /> Visit related link
          </a>
        )}

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-ink/10">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-ink/5 text-ink/60 border border-ink/10">
                {tag}
              </span>
            ))}
          </div>
        )}

        <ReactionBar slug={post.slug} />
      </div>
    </div>
  );
}

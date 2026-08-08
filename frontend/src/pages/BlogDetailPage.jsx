import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import Markdown from '@/components/ui/Markdown';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { sampleBlogPosts } from '@/utils/sampleData';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { absoluteUrl, truncate, stripMarkdown, resolveImage } from '@/utils/seo';

// Kept in sync with backend `ALLOWED_REACTIONS` (blogEngagement.service.js).
const REACTION_EMOJIS = ['👍', '❤️', '🔥', '🎉', '💡'];

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

  async function handleClick(emoji) {
    if (busy) return;
    setBusy(true);
    const { data } = mine === emoji
      ? await PortfolioAPI.removeReaction(slug)
      : await PortfolioAPI.setReaction(slug, emoji);
    if (data) {
      setCounts(data.counts || {});
      setMine(data.mine ?? null);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-white/10">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleClick(emoji)}
          disabled={busy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors disabled:opacity-50 ${
            mine === emoji
              ? 'bg-accent/20 border-accent/50 text-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>{emoji}</span>
          <span className="text-xs">{counts[emoji] ?? 0}</span>
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
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
          <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.published_at)}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {post.views ?? 0} views</span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">{post.title}</h1>

        <Markdown>{post.content}</Markdown>

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/10">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/60 border border-white/10">
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

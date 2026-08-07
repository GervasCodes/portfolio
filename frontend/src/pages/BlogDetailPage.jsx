import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import Markdown from '@/components/ui/Markdown';
import { PortfolioAPI } from '@/services/api';
import { sampleBlogPosts } from '@/utils/sampleData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const fallback = sampleBlogPosts.find((p) => p.slug === slug) || sampleBlogPosts[0];
  const [post, setPost] = useState(fallback);

  const settings = useSiteSettings();
  useDocumentTitle(buildTitle(post ? post.title : 'Blog Post', settings));

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

  return (
    <div className="pt-28 pb-24">
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
      </div>
    </div>
  );
}

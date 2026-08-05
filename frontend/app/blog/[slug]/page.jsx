import Link from 'next/link';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import Markdown from '@/components/ui/Markdown';
import { PortfolioAPI } from '@/services/api';
import { sampleBlogPosts } from '@/utils/sampleData';

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export async function generateMetadata({ params }) {
  const { data } = await PortfolioAPI.getPostBySlug(params.slug);
  const post = data || sampleBlogPosts.find((p) => p.slug === params.slug);
  return { title: post ? `${post.title} — Blog` : 'Blog Post' };
}

export default async function BlogDetailPage({ params }) {
  const { data } = await PortfolioAPI.getPostBySlug(params.slug);
  const post = data || sampleBlogPosts.find((p) => p.slug === params.slug) || sampleBlogPosts[0];

  return (
    <div className="pt-28 pb-24">
      <div className="container-page max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8">
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

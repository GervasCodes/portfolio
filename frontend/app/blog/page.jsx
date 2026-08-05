import Link from 'next/link';
import { Calendar, Eye } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { PortfolioAPI } from '@/services/api';
import { sampleBlogPosts } from '@/utils/sampleData';

export const metadata = { title: 'Blog — Portfolio' };

const LIMIT = 6;

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogPage({ searchParams }) {
  const { tag } = searchParams || {};
  const page = Math.max(parseInt(searchParams?.page, 10) || 1, 1);

  const { data, meta } = await PortfolioAPI.getPosts({ page, limit: LIMIT, tag });
  const posts = data?.length ? data : (page === 1 ? sampleBlogPosts : []);
  const total = meta?.total ?? posts.length;

  return (
    <div className="pt-28 pb-24">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-label">Writing</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            From the <span className="text-gradient">Blog</span>
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {posts.map((post) => (
            <Link
              key={post.id || post.slug}
              href={`/blog/${post.slug}`}
              className="glass glass-hover rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.published_at)}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {post.views ?? 0}</span>
              </div>
              <h2 className="font-display font-semibold text-lg mb-2">{post.title}</h2>
              <p className="text-sm text-white/55 flex-1">{post.excerpt}</p>
              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((t) => (
                    <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-white/50">No posts found.</p>
        )}

        <Pagination
          basePath="/blog"
          page={page}
          limit={LIMIT}
          total={total}
          extraParams={tag ? { tag } : {}}
        />
      </div>
    </div>
  );
}

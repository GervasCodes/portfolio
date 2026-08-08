import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import NewsletterSignup from '@/components/sections/NewsletterSignup';
import { PortfolioAPI } from '@/services/api';
import { sampleBlogPosts } from '@/utils/sampleData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

const LIMIT = 6;

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Blog', settings));

  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag') || undefined;
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  const [posts, setPosts] = useState(page === 1 ? sampleBlogPosts : []);
  const [total, setTotal] = useState(sampleBlogPosts.length);
  const [mostViewed, setMostViewed] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, meta } = await PortfolioAPI.getPosts({ page, limit: LIMIT, tag });
      if (!mounted) return;
      const resolvedPosts = data?.length ? data : (page === 1 ? sampleBlogPosts : []);
      setPosts(resolvedPosts);
      setTotal(meta?.total ?? resolvedPosts.length);
    })();
    return () => { mounted = false; };
  }, [page, tag]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getMostViewedPosts(5);
      if (mounted && data?.length) setMostViewed(data);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pt-28 pb-24">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-label">Writing</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            From the <span className="text-gradient">Blog</span>
          </h1>
        </div>

        {page === 1 && mostViewed.length > 0 && (
          <div className="max-w-4xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Most Viewed</p>
            <div className="flex flex-wrap gap-3">
              {mostViewed.map((post) => (
                <Link
                  key={post.id || post.slug}
                  to={`/blog/${post.slug}`}
                  className="glass glass-hover rounded-full px-4 py-2 flex items-center gap-2 text-sm"
                >
                  <span className="text-white/80">{post.title}</span>
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <Eye size={12} /> {post.views ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {page === 1 && (
          <div className="max-w-4xl mx-auto mb-10">
            <NewsletterSignup />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {posts.map((post) => (
            <Link
              key={post.id || post.slug}
              to={`/blog/${post.slug}`}
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

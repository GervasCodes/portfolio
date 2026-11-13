import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '@/components/ui/Pagination';
import SectionHeader from '@/components/ui/SectionHeader';
import Tag from '@/components/ui/Tag';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import NewsletterSignup from '@/components/sections/NewsletterSignup';
import { PortfolioAPI } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

const LIMIT = 10;

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Writing', settings));

  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag') || undefined;
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  const [state, setState] = useState({ status: 'loading', posts: [], total: 0 });

  useEffect(() => {
    let mounted = true;
    setState((s) => ({ ...s, status: 'loading' }));
    (async () => {
      const { data, meta, error } = await PortfolioAPI.getPosts({ page, limit: LIMIT, tag });
      if (!mounted) return;
      if (error) setState({ status: 'error', posts: [], total: 0 });
      else setState({ status: 'ready', posts: data || [], total: meta?.total ?? (data || []).length });
    })();
    return () => { mounted = false; };
  }, [page, tag]);

  const { status, posts, total } = state;

  return (
    <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <div className="container-page max-w-3xl">
        <SectionHeader
          as="h1"
          eyebrow="Writing"
          title={tag ? `Posts tagged “${tag}”` : 'Writing'}
          description="Notes on what I build and what I learn along the way."
        />

        {status === 'loading' && <Skeleton className="h-48 w-full" />}
        {status === 'error' && (
          <ErrorState title="Posts could not be loaded" message="Check your connection, then try again." onRetry={() => window.location.reload()} />
        )}
        {status === 'ready' && posts.length === 0 && (
          <EmptyState title="No posts yet" description={tag ? 'Nothing is tagged with this.' : 'New writing will appear here.'} />
        )}
        {status === 'ready' && posts.length > 0 && (
          <>
            <ul className="divide-y divide-line border-y border-line">
              {posts.map((post) => (
                <li key={post.id || post.slug}>
                  <Link to={`/blog/${post.slug}`} className="group block py-6">
                    <p className="text-sm text-muted">{formatDate(post.published_at)}</p>
                    <h2 className="font-display text-2xl font-normal mt-1 group-hover:text-accent">{post.title}</h2>
                    {post.excerpt && <p className="mt-2 text-muted max-w-prose">{post.excerpt}</p>}
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination basePath="/blog" page={page} limit={LIMIT} total={total} extraParams={tag ? { tag } : {}} />
          </>
        )}

        {page === 1 && (
          <div className="mt-16">
            <NewsletterSignup />
          </div>
        )}
      </div>
    </div>
  );
}

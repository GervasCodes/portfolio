import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import SectionHeader from '@/components/ui/SectionHeader';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Reveal from '@/components/ui/Reveal';
import Seo from '@/components/seo/Seo';
import PostCard from '@/components/blog/PostCard';
import NewsletterSignup from '@/components/sections/NewsletterSignup';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

const LIMIT = 10;
const DESCRIPTION = 'Notes on what I build and what I learn along the way.';

// Writing index: the latest post gets a wide feature card on page 1 (no tag
// filter), everything else is a card grid. Covers come from the post; a post
// without one gets generated art. Reading time is computed from the post text.
export default function BlogPage() {
  const settings = useSiteSettings();
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag') || undefined;
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  const [state, setState] = useState({ status: 'loading', posts: [], total: 0 });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

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
  }, [page, tag, attempt]);

  const { status, posts, total } = state;
  const showFeatured = status === 'ready' && page === 1 && !tag && posts.length > 0;
  const [featured, ...rest] = showFeatured ? posts : [null, ...posts];
  const grid = showFeatured ? rest : posts;

  return (
    <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <Seo title={buildTitle('Writing', settings)} description={DESCRIPTION} path="/blog" siteName={settings?.site_title} />
      <div className="container-page">
        <SectionHeader
          as="h1"
          eyebrow="Writing"
          title={tag ? <>Posts tagged <em>“{tag}”</em></> : <>Notes &amp; <em>writing</em></>}
          description={DESCRIPTION}
        />

        {tag && (
          <p className="-mt-6 mb-10">
            <Link
              to="/blog"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted transition-colors duration-fast hover:border-control hover:text-ink"
            >
              <X size={14} aria-hidden="true" /> Clear filter
            </Link>
          </p>
        )}

        {status === 'loading' && (
          <div aria-busy="true" aria-label="Loading posts" className="space-y-6">
            <Skeleton className="h-80 w-full rounded-3xl" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 w-full rounded-3xl" />)}
            </div>
          </div>
        )}
        {status === 'error' && (
          <ErrorState title="Posts could not be loaded" message="Check your connection, then try again." onRetry={retry} />
        )}
        {status === 'ready' && posts.length === 0 && (
          <EmptyState
            title={tag ? 'Nothing with that tag' : 'No posts yet'}
            description={tag ? 'No published post carries this tag.' : 'New writing will appear here.'}
            seed="writing"
          />
        )}

        {status === 'ready' && posts.length > 0 && (
          <>
            {featured && (
              <Reveal className="mb-6">
                <PostCard post={featured} featured />
              </Reveal>
            )}
            {grid.length > 0 && (
              <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
                {grid.map((post, i) => (
                  <Reveal as="li" key={post.id || post.slug} delay={Math.min(i, 5) * 60}>
                    <PostCard post={post} />
                  </Reveal>
                ))}
              </ul>
            )}
            <Pagination basePath="/blog" page={page} limit={LIMIT} total={total} extraParams={tag ? { tag } : {}} />
          </>
        )}

        {page === 1 && status !== 'loading' && (
          <div className="mt-20">
            <NewsletterSignup />
          </div>
        )}
      </div>
    </div>
  );
}

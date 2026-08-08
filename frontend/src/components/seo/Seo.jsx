import { Helmet } from 'react-helmet-async';
import { absoluteUrl } from '@/utils/seo';

/**
 * Per-route SEO tags: <title>, meta description, canonical link,
 * Open Graph + Twitter Card tags, and optional JSON-LD structured data.
 *
 * NOTE (SPA caveat): this site is a client-rendered Vite SPA, so these
 * tags are injected after JS runs. Google's crawler executes JS and
 * reads them fine; some social-card crawlers (older Facebook/Twitter
 * bots, some link-preview bots) do not execute JS and may only see the
 * static fallback tags in index.html. If rich social previews turn out
 * to matter more than search ranking, the fix is prerendering/SSR for
 * these specific routes, not something this component can solve alone.
 */
export default function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  siteName,
  structuredData,
  noindex = false,
}) {
  const url = path ? absoluteUrl(path) : undefined;
  const blocks = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {siteName && <meta property="og:site_name" content={siteName} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {blocks.map((block, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}

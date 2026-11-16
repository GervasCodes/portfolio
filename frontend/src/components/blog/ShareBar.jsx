import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { shareLinks } from '@/utils/blogContent';

const BTN = 'inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted transition-colors duration-fast hover:border-control hover:text-ink';

/** Copy link, the device's native share sheet when there is one, and plain share links. */
export default function ShareBar({ url, title }) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', url);
    }
  }
  async function nativeShare() {
    try { await navigator.share({ title, url }); } catch { /* cancelled */ }
  }

  return (
    <div role="group" aria-label="Share this post" className="flex flex-wrap items-center gap-2">
      <span className="section-label mr-2">Share</span>
      <button type="button" onClick={copy} className={BTN}>
        {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      {canShare && (
        <button type="button" onClick={nativeShare} className={BTN}>
          <Share2 size={15} aria-hidden="true" /> Share…
        </button>
      )}
      {shareLinks(url, title).map((l) => (
        <a key={l.id} href={l.href} target="_blank" rel="noreferrer" className={BTN} aria-label={`Share on ${l.label} (opens in a new tab)`}>
          {l.label}
        </a>
      ))}
      <span className="sr-only" role="status">{copied ? 'Link copied to clipboard' : ''}</span>
    </div>
  );
}

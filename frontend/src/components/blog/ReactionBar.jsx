import { useEffect, useState } from 'react';
import { ThumbsUp, Heart, Flame, PartyPopper, Lightbulb } from 'lucide-react';
import { PortfolioAPI } from '@/services/api';

// Kept in sync with backend `ALLOWED_REACTIONS` (blogEngagement.service.js).
const REACTIONS = [
  { id: 'like', label: 'Like', Icon: ThumbsUp },
  { id: 'love', label: 'Love', Icon: Heart },
  { id: 'fire', label: 'Fire', Icon: Flame },
  { id: 'celebrate', label: 'Celebrate', Icon: PartyPopper },
  { id: 'idea', label: 'Insightful', Icon: Lightbulb },
];

/** Same behaviour as before (toggle one reaction per visitor); 44 px targets and token colours. */
export default function ReactionBar({ slug }) {
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
    <div role="group" aria-label="Reactions" className="flex flex-wrap items-center gap-2">
      <span className="section-label mr-2">React</span>
      {REACTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleClick(id)}
          disabled={busy}
          aria-label={`${label}, ${counts[id] ?? 0} so far`}
          aria-pressed={mine === id}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-fast disabled:opacity-60 ${
            mine === id
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-line text-muted hover:border-control hover:text-ink'
          }`}
        >
          <Icon size={15} aria-hidden="true" />
          <span className="text-xs">{counts[id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

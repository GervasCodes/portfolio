import { useCallback, useEffect, useRef, useState } from 'react';
import { PortfolioAPI } from '@/services/api';

// Hover preview for project cards. If the project has a short muted video in
// its media gallery, it plays while the card is hovered or focused; otherwise
// the cover image stays. The media list is requested only on the first
// hover/focus (never on page load), once per project, and never on touch
// devices, with reduced motion, or with data-saver on.
const found = new Map();      // projectId -> { url } | null
const inflight = new Map();   // projectId -> Promise

const eligible = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !navigator.connection?.saveData;

function lookup(projectId) {
  if (found.has(projectId)) return Promise.resolve(found.get(projectId));
  if (!inflight.has(projectId)) {
    inflight.set(
      projectId,
      PortfolioAPI.getProjectMedia(projectId).then(({ data }) => {
        const video = Array.isArray(data) ? data.find((m) => m.media_type === 'video' && m.url) : null;
        const result = video ? { url: video.url } : null;
        found.set(projectId, result);
        inflight.delete(projectId);
        return result;
      })
    );
  }
  return inflight.get(projectId);
}

export function useHoverVideo(projectId) {
  const [src, setSrc] = useState(found.get(projectId)?.url || null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);

  const start = useCallback(() => {
    if (!projectId || !eligible()) return;
    setActive(true);
    lookup(projectId).then((r) => { if (r?.url) setSrc(r.url); });
  }, [projectId]);

  const stop = useCallback(() => {
    setActive(false);
    setReady(false);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active && src) el.play().catch(() => {});
    else el.pause();
  }, [active, src]);

  return {
    src,
    visible: active && ready,
    videoRef,
    onPlaying: () => setReady(true),
    handlers: { onPointerEnter: start, onPointerLeave: stop, onFocus: start, onBlur: stop },
  };
}

export default useHoverVideo;

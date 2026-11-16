// Tiny runtime flags written to <html> so CSS can react without React state:
//   data-tab-hidden="true"  -> ambient glow + marquee pause while the tab is hidden
//   data-save-data="1"      -> grain and other extras are dropped (also set pre-paint in index.html)
export function watchRuntimeFlags() {
  const root = document.documentElement;
  const sync = () => root.setAttribute('data-tab-hidden', String(document.hidden));
  sync();
  document.addEventListener('visibilitychange', sync);

  const conn = navigator.connection;
  const syncData = () => {
    if (conn?.saveData) root.setAttribute('data-save-data', '1');
    else root.removeAttribute('data-save-data');
  };
  syncData();
  conn?.addEventListener?.('change', syncData);

  return () => {
    document.removeEventListener('visibilitychange', sync);
    conn?.removeEventListener?.('change', syncData);
  };
}

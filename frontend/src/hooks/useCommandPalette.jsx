import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Open/close state for the command palette, shared by the navbar button, the
 * footer, the 404 page and the global Cmd/Ctrl+K shortcut. The palette itself
 * (components/layout/CommandPalette.jsx) is code-split and only downloaded the
 * first time it is opened.
 */
const PaletteContext = createContext({ open: false, openPalette: () => {}, closePalette: () => {} });

export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({ open, openPalette, closePalette }), [open, openPalette, closePalette]);
  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCommandPalette() {
  return useContext(PaletteContext);
}

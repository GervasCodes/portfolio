import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

const TONE_CLASS = {
  success: 'border-l-success',
  error: 'border-l-danger',
  info: 'border-l-accent',
};

/**
 * Wrap the app once, then call `useToast()` anywhere:
 *   const toast = useToast();  toast.success('Saved');  toast.error('Save failed');
 * Errors stay until dismissed (so a failed save can never go unnoticed);
 * success/info clear themselves after 5 seconds.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback((tone, message) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((list) => [...list, { id, tone, message }]);
    if (tone !== 'error') setTimeout(() => dismiss(id), 5000);
    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
    dismiss,
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[110] flex flex-col gap-2 w-[min(92vw,22rem)]" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={`bg-surface-2 border-l-4 border border-line ${TONE_CLASS[t.tone]} rounded-2xl shadow-overlay px-4 py-3 flex items-start gap-3 text-sm animate-fade-in`}
          >
            <p className="flex-1">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="-m-2 w-11 h-11 inline-flex items-center justify-center rounded-full text-muted hover:text-ink">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

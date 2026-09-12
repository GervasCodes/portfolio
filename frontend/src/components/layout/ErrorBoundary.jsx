import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Catches render-time errors anywhere below it in the tree and shows a
 * designed fallback instead of an unstyled blank white screen. React
 * error boundaries only work as class components (no Hook equivalent),
 * hence the class here despite the rest of the app being function
 * components throughout.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // No monitoring/Sentry integration yet (see the audit's backend
    // hardening notes) — console.error is at least visible in the
    // browser devtools and in server-side logs for SSR setups later.
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-premium p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-accent to-cyan-accent mx-auto mb-4 flex items-center justify-center shadow-glow">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <h1 className="font-display text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-ink/60 mb-6">
            This part of the page hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={this.handleReload}
            className="glass glass-hover rounded-xl px-5 py-2.5 text-sm inline-flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={15} /> Reload page
          </button>
        </div>
      </div>
    );
  }
}

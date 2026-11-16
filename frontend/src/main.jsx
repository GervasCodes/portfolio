import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import App from './App.jsx';
import ErrorBoundary from './components/layout/ErrorBoundary.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { ThemeProvider } from './theme/ThemeProvider.jsx';
// Self-hosted fonts (no third-party requests), 3 families, font-display: swap.
// Instrument Serif has one weight (400) + italic: import only the Latin subset.
// The two Geist variable files are split by unicode-range, so browsers download
// only the Latin subset (latin-ext loads only if a CMS string needs it).
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          {/* reducedMotion="user" makes every motion.* component in the tree
              respect the OS-level prefers-reduced-motion setting automatically
              (position/scale/rotate/layout animations resolve instantly,
              opacity fades still play) — one place to handle this instead of
              gating each of the ~14 files that use Framer Motion individually. */}
          <MotionConfig reducedMotion="user">
            <ThemeProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </ThemeProvider>
          </MotionConfig>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

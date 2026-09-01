/**
 * Visually hidden until keyboard-focused, then jumps straight to the
 * `#main-content` landmark — lets keyboard/screen-reader users bypass the
 * nav (and, on admin screens, the sidebar) instead of tabbing through it
 * on every single page.
 */
export default function SkipToContent() {
  return (
    <a href="#main-content" className="skip-to-content">
      Skip to content
    </a>
  );
}

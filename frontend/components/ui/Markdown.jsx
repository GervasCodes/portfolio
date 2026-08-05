import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders blog post Markdown with a small set of themed overrides so it
 * matches the dark glassmorphism design instead of browser defaults.
 */
export default function Markdown({ children }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-accent-light prose-code:text-cyan-accent prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-img:rounded-xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ''}</ReactMarkdown>
    </div>
  );
}

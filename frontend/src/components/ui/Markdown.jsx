import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders blog post Markdown with a small set of themed overrides so it
 * matches the dark glassmorphism design instead of browser defaults.
 */
export default function Markdown({ children }) {
  return (
    <div className="prose max-w-none prose-headings:font-display prose-a:text-accent-dark prose-code:text-[#8a6a35] prose-pre:bg-ink/5 prose-pre:border prose-pre:border-ink/10 prose-img:rounded-xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ''}</ReactMarkdown>
    </div>
  );
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders blog post Markdown using the shared `.prose` styles from index.css (design tokens).
 */
export default function Markdown({ children }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ''}</ReactMarkdown>
    </div>
  );
}

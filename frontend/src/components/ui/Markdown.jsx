import { memo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';
import { uniqueSlugger } from '@/utils/blogContent';

function textOf(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return textOf(node.props?.children);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / insecure origins: fall back to a hidden textarea.
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** A code block with a copy button (keyboard reachable, announces the result). */
function CodeBlock({ children }) {
  const ref = useRef(null);
  const [state, setState] = useState('idle'); // idle | copied | failed
  const language = /language-([\w-]+)/.exec(children?.props?.className || '')?.[1];

  async function copy() {
    const ok = await copyText(ref.current?.textContent || '');
    setState(ok ? 'copied' : 'failed');
    window.setTimeout(() => setState('idle'), 2000);
  }

  return (
    <div className="code-block">
      <div className="code-block-bar">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{language || 'code'}</span>
        <button type="button" onClick={copy} className="code-copy" aria-label="Copy code to clipboard">
          {state === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          <span>{state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : 'Copy'}</span>
        </button>
        <span className="sr-only" role="status">{state === 'copied' ? 'Code copied to clipboard' : ''}</span>
      </div>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}

/**
 * Renders blog/case-study Markdown with the shared `.prose` styles.
 * Adds: stable ids on h2-h4 (for the table of contents and deep links),
 * copy buttons on code blocks, and safe new-tab handling on external links.
 */
function Markdown({ children }) {
  // A fresh slugger per render keeps ids stable and unique within one document.
  const slug = uniqueSlugger();
  const heading = (Tag) => function Heading({ node: _node, children: kids, ...rest }) {
    return <Tag id={slug(textOf(kids))} {...rest}>{kids}</Tag>;
  };
  const components = {
    h2: heading('h2'),
    h3: heading('h3'),
    h4: heading('h4'),
    pre: ({ node: _node, children: kids }) => <CodeBlock>{kids}</CodeBlock>,
    a: ({ node: _node, href, children: kids, ...rest }) => {
      const external = /^https?:\/\//i.test(href || '');
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} {...rest}>
          {kids}
        </a>
      );
    },
  };
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{children || ''}</ReactMarkdown>
    </div>
  );
}

// Memoised: a parent re-render (a reaction click, say) must not rebuild the whole article.
export default memo(Markdown);

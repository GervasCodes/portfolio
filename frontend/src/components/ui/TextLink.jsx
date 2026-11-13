import { Link } from 'react-router-dom';

const isExternalHref = (href) => /^([a-z]+:|#)/i.test(href);

/** Inline text link: accent colour, underlined, thicker underline on hover. */
export default function TextLink({ href, children, className = '', ...rest }) {
  const classes = `text-accent underline underline-offset-4 decoration-1 hover:decoration-2 ${className}`;
  if (isExternalHref(href)) {
    const newTab = !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:');
    return (
      <a href={href} className={classes} {...(newTab ? { target: '_blank', rel: 'noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return <Link to={href} className={classes} {...rest}>{children}</Link>;
}

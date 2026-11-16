import { usePostCount } from '@/hooks/usePostCount';

// Single source of truth for the primary navigation (navbar, mobile menu,
// footer, command palette). Writing appears as soon as at least one post is
// published; /blog keeps working by URL either way.
const LINKS = [
  { href: '/projects', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Writing', needsPosts: true },
  { href: '/resume', label: 'Resume' },
  { href: '/contact', label: 'Contact' },
];

export function useNavLinks() {
  const postCount = usePostCount();
  return LINKS.filter((l) => !l.needsPosts || (postCount ?? 0) >= 1);
}

export default useNavLinks;

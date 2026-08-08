import { useEffect, useState } from 'react';

/**
 * Returns `value`, but only updates after `delay` ms of no further
 * changes — used to avoid firing a search request on every keystroke.
 */
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;

import { useEffect, useState } from 'react';

// The owner's time zone. East Africa Time has no daylight saving, so a fixed
// IANA zone is exact. The label "EAT" is the abbreviation the brief asks for.
const ZONE = 'Africa/Dar_es_Salaam';

function format(now) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: ZONE, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(now);
  } catch {
    return null; // very old browsers without Intl time-zone support: show nothing
  }
}

/**
 * "HH:MM" in the owner's time zone, or null when it can't be computed.
 * Ticks once per minute (aligned to the minute) and stops while the tab is
 * hidden, so it costs nothing in the background.
 */
export function useLocalTime() {
  const [time, setTime] = useState(() => format(new Date()));

  useEffect(() => {
    let timer;
    const tick = () => {
      const now = new Date();
      setTime(format(now));
      timer = window.setTimeout(tick, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50);
    };
    const onVisibility = () => {
      window.clearTimeout(timer);
      if (!document.hidden) tick();
    };
    tick();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return time;
}

export default useLocalTime;

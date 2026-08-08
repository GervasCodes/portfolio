/**
 * Parses simple duration strings ('15m', '7d', '30s', '500ms') into
 * milliseconds. Used to keep cookie maxAge and DB expiry timestamps in
 * sync with the JWT `expiresIn` strings already used throughout config,
 * instead of hardcoding a separate millisecond value that can drift out
 * of sync with the token's real lifetime.
 */
const UNIT_MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

function parseDurationMs(input, fallbackMs) {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  const match = /^(\d+)\s*(ms|s|m|h|d)$/i.exec(String(input ?? '').trim());
  if (!match) return fallbackMs;
  const [, value, unit] = match;
  return Number(value) * UNIT_MS[unit.toLowerCase()];
}

module.exports = { parseDurationMs };

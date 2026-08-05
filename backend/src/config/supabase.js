const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

/**
 * Single Supabase client instance, shared by the storage service.
 * Kept isolated here so swapping storage backends only touches
 * `services/storage.service.js`, not the rest of the app.
 *
 * IMPORTANT: supabase-js throws synchronously if given an invalid URL,
 * which would crash the whole server at require-time before env vars
 * are configured (e.g. on first run). We fall back to a syntactically
 * valid placeholder URL so the app boots; any real upload attempt will
 * then fail with a clear "Upload failed" error instead of a hard crash.
 */
let client = null;

function getSupabaseClient() {
  if (!client) {
    const configured = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY);
    if (!configured) {
      console.warn('[supabase] SUPABASE_URL / SUPABASE_SERVICE_KEY not set. Media uploads will fail until configured.');
    }
    client = createClient(
      env.SUPABASE_URL || 'https://placeholder.supabase.co',
      env.SUPABASE_SERVICE_KEY || 'placeholder-key',
      { auth: { persistSession: false } }
    );
  }
  return client;
}

module.exports = { getSupabaseClient };

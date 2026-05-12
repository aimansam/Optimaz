import { createBrowserClient } from '@supabase/ssr';

let _client: ReturnType<typeof createBrowserClient> | null = null;

const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder-anon-key';

function resolveUrl(raw: string | undefined): string {
  if (!raw) return FALLBACK_URL;

  try {
    new URL(raw);
    return raw;
  } catch {
    return FALLBACK_URL;
  }
}

export function createClient() {
  if (typeof window === 'undefined') {
    // SSR / build-time: return a client with safe fallback values
    return createBrowserClient(
      resolveUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY
    );
  }
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

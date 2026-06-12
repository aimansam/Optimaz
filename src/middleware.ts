import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - public assets (icons, images, manifest, sw.js, robots.txt)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|manifest\\.json|sw\\.js|icon-|apple-touch|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

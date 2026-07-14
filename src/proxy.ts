import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed `middleware.ts` to `proxy.ts`. next-intl handles locale
// negotiation, redirects and rewrites. Role-based route protection is enforced
// in the dashboard layouts/server actions (see src/lib/auth-guard.ts).
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - API routes (/api, /trpc)
  // - Next.js internals (/_next, /_vercel)
  // - files with an extension (e.g. favicon.ico, images)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};

import { NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * Triggered by Vercel Cron (see vercel.json). Scans saved searches and emails
 * clients about new matching properties and opportunity prices.
 *
 * Phase 2: implement the matching + email dispatch. This endpoint is already
 * wired and secured so the schedule can be enabled without code changes.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // TODO (phase 2): query SavedSearch, match against newly APPROVED / AVAILABLE
  // properties since lastNotifiedAt, send emails via Resend, update lastNotifiedAt.
  const processed = 0;

  return NextResponse.json({ ok: true, processed });
}

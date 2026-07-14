import { NextResponse } from "next/server";

// Serverless webhook for the Telegram bot (no polling — Vercel-friendly).
// Configure the webhook with the secret token so Telegram sends it back in the
// `X-Telegram-Bot-Api-Secret-Token` header.
export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const provided = request.headers.get("x-telegram-bot-api-secret-token");
    if (provided !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let update: unknown;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // TODO (phase 2): route commands / link chat IDs to realtor accounts.
  console.log("[telegram] update received", update);

  return NextResponse.json({ ok: true });
}

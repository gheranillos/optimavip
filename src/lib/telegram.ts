const token = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Sends a message via the Telegram Bot API (HTTP). No-op if token is unset.
 * Designed for serverless (no long-running polling).
 */
export async function sendTelegramMessage(chatId: string | number, text: string) {
  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[telegram] TELEGRAM_BOT_TOKEN not set — skipping send");
    }
    return { skipped: true as const };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    throw new Error(`Telegram API error: ${res.status}`);
  }
  return res.json();
}

/** Shared HTML shell for transactional emails (Resend). */
export function brandEmailLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:24px 12px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#1d4ed8;color:#ffffff;padding:20px 28px;font-size:20px;font-weight:700;letter-spacing:0.5px;">
            OPTIMA VIP
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <h1 style="margin:0 0 16px;font-size:18px;color:#0f172a;">${title}</h1>
            <div style="font-size:14px;line-height:1.6;color:#334155;">${bodyHtml}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;background:#f8fafc;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;">
            OPTIMA VIP · Lechería · El Tigre, Venezuela
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function formatPrice(
  amount: number,
  currency = "USD",
  locale = "es-VE"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(locale)}`;
  }
}

export function formatArea(m2: number | null | undefined): string | null {
  if (m2 === null || m2 === undefined) return null;
  return `${m2.toLocaleString("es-VE")} m²`;
}

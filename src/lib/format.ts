export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatPrice(
  priceType: "FIXED" | "STARTING_AT" | "ON_REQUEST",
  priceCents: number | null,
  currency: string,
): string {
  if (priceType === "ON_REQUEST" || priceCents === null) return "On request";
  const amount = formatMoney(priceCents, currency);
  return priceType === "FIXED" ? amount : `from ${amount}`;
}

export function formatDelivery(days: number | null): string | null {
  if (!days) return null;
  if (days < 14) return `${days} days`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "1 week" : `${weeks} weeks`;
}

export function formatDateRange(
  start: Date,
  end: Date | null,
  current: boolean,
): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en", { month: "short", year: "numeric" });
  return `${fmt(start)} — ${current ? "Present" : end ? fmt(end) : ""}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function groupBy<T>(items: T[], key: (item: T) => string): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return [...map.entries()];
}

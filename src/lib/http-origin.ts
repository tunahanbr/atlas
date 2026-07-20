export function isSameOrigin(originValue: string | null, hostValue: string | null): boolean {
  if (!originValue || !hostValue) return false;
  const requestHost = hostValue.split(",")[0]?.trim().toLowerCase();
  if (!requestHost) return false;

  try {
    const origin = new URL(originValue);
    return (
      (origin.protocol === "http:" || origin.protocol === "https:") &&
      origin.host.toLowerCase() === requestHost
    );
  } catch {
    return false;
  }
}

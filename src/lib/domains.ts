export function normalizeHostname(value: string): string | null {
  const candidate = value.trim().toLowerCase().replace(/\.$/, "");
  if (!candidate || candidate.length > 253 || candidate.includes("://")) return null;

  try {
    const url = new URL(`http://${candidate}`);
    const hostname = url.hostname.toLowerCase();
    if (
      url.port ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      hostname !== candidate ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
      !hostname.includes(".")
    ) {
      return null;
    }

    const labels = hostname.split(".");
    if (
      labels.some(
        (label) =>
          !label ||
          label.length > 63 ||
          label.startsWith("-") ||
          label.endsWith("-") ||
          !/^[a-z0-9-]+$/.test(label),
      )
    ) {
      return null;
    }
    return hostname;
  } catch {
    return null;
  }
}

export function requestHostname(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim().toLowerCase();
  if (!first) return null;
  try {
    return new URL(`http://${first}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function platformHostname(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").hostname;
  } catch {
    return "localhost";
  }
}

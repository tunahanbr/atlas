// Usernames that can never be registered because they collide with app routes
// or would confuse users. Keep in sync with src/app directory structure.
export const RESERVED_USERNAMES = new Set([
  "app",
  "api",
  "login",
  "logout",
  "setup",
  "explore",
  "legal",
  "privacy",
  "terms",
  "admin",
  "support",
  "help",
  "about",
  "blog",
  "pricing",
  "settings",
  "dashboard",
  "auth",
  "www",
  "mail",
  "atlas",
  "new",
  "search",
  "work",
  "_next",
  "favicon.ico",
]);

export const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

export const BUDGET_OPTIONS = [
  "Under €1,000",
  "€1,000 – €5,000",
  "€5,000 – €15,000",
  "€15,000 – €50,000",
  "€50,000+",
] as const;

export const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "Available for work",
  LIMITED: "Limited availability",
  UNAVAILABLE: "Not available",
};

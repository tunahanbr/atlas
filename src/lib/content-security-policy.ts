export function createContentSecurityPolicy(isDevelopment: boolean): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob: https: http:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");
}

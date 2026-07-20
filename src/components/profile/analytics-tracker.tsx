"use client";

import { useEffect, type MouseEventHandler, type ReactNode } from "react";
import Link from "next/link";

import type { AnalyticsEvent } from "@/lib/analytics";

function sendEvent(username: string, event: AnalyticsEvent) {
  const body = JSON.stringify({ username, event });
  if (
    navigator.sendBeacon &&
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }))
  ) {
    return;
  }
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function AnalyticsPageView({
  username,
  event,
  pageKey,
}: {
  username: string;
  event: "PROFILE_VIEW" | "PROJECT_VIEW";
  pageKey: string;
}) {
  useEffect(() => {
    const key = `atlas:analytics:${new Date().toISOString().slice(0, 10)}:${pageKey}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Analytics must remain functional when storage is disabled.
    }
    sendEvent(username, event);
  }, [event, pageKey, username]);

  return null;
}

export function AnalyticsLink({
  username,
  event,
  href,
  className,
  children,
}: {
  username: string;
  event: "PROJECT_CLICK" | "SERVICE_CLICK";
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const track: MouseEventHandler<HTMLAnchorElement> = () => sendEvent(username, event);
  return (
    <Link href={href} className={className} onClick={track}>
      {children}
    </Link>
  );
}

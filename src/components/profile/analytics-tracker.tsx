"use client";

import { useEffect, type MouseEventHandler, type ReactNode } from "react";
import Link from "next/link";

import type { AnalyticsEvent } from "@/lib/analytics";

function sendEvent(username: string, event: AnalyticsEvent, pageKey: string) {
  const body = JSON.stringify({ username, event, pageKey });
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
    sendEvent(username, event, pageKey);
  }, [event, pageKey, username]);

  return null;
}

export function AnalyticsLink({
  username,
  event,
  pageKey,
  href,
  className,
  children,
}: {
  username: string;
  event: "PROJECT_CLICK" | "SERVICE_CLICK";
  pageKey: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const track: MouseEventHandler<HTMLAnchorElement> = () => sendEvent(username, event, pageKey);
  return (
    <Link href={href} className={className} onClick={track}>
      {children}
    </Link>
  );
}

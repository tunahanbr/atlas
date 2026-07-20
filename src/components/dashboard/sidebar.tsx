"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  MessageSquareQuote,
  Palette,
  Settings,
  User,
  ExternalLink,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "./sign-out-button";

const NAV = [
  {
    group: "Main",
    items: [
      { href: "/app", label: "Overview", icon: LayoutDashboard },
      { href: "/app/leads", label: "Leads", icon: Inbox, badge: true },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/app/profile", label: "Profile", icon: User },
      { href: "/app/services", label: "Services", icon: Briefcase },
      { href: "/app/portfolio", label: "Portfolio", icon: FolderKanban },
      { href: "/app/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    ],
  },
  {
    group: "Configure",
    items: [
      { href: "/app/appearance", label: "Appearance", icon: Palette },
      { href: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar({
  username,
  newLeads,
  userName,
  userEmail,
}: {
  username: string;
  newLeads: number;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-svh w-60 shrink-0 flex-col border-r bg-muted/30">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/app" className="text-sm font-semibold tracking-tight">
          Atlas
        </Link>
        <Link
          href={`/${username}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View profile
          <ExternalLink className="size-3" />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-background font-medium shadow-sm"
                          : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && newLeads > 0 ? (
                        <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold leading-none text-brand-foreground">
                          {newLeads}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}

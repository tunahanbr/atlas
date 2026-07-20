"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ChartNoAxesCombined,
  ExternalLink,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Menu,
  MessageSquareQuote,
  Palette,
  Settings,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SignOutButton } from "./sign-out-button";

const NAV = [
  {
    group: "Main",
    items: [
      { href: "/app", label: "Overview", icon: LayoutDashboard },
      { href: "/app/analytics", label: "Analytics", icon: ChartNoAxesCombined },
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

type SidebarProps = {
  username: string;
  published: boolean;
  newLeads: number;
  userName: string;
  userEmail: string;
};

export function Sidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="hairline sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/app" className="group inline-flex items-center gap-2.5">
          <span className="size-1.5 rotate-45 bg-foreground transition-transform duration-500 group-hover:rotate-[225deg]" />
          <span className="font-editorial text-base">Atlas</span>
        </Link>
        <div className="flex items-center gap-1">
          {props.newLeads > 0 ? (
            <Link
              href="/app/leads"
              className="rounded-full bg-brand px-2 py-1 text-xs font-semibold text-brand-foreground"
              aria-label={`${props.newLeads} new leads`}
            >
              {props.newLeads}
            </Link>
          ) : null}
          <ThemeToggle />
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger
              render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}
            >
              <Menu className="size-5" />
            </DialogTrigger>
            <DialogContent
              className="top-0 left-0 h-svh w-72 max-w-[85vw] -translate-x-0 -translate-y-0 grid-rows-[auto_1fr_auto] gap-0 rounded-none border-0 border-r bg-background p-0"
            >
              <DialogTitle className="sr-only">Dashboard navigation</DialogTitle>
              <DialogDescription className="sr-only">
                Navigate between Atlas dashboard sections.
              </DialogDescription>
              <SidebarContent {...props} onNavigate={() => setMobileOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <aside className="hairline sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r bg-sidebar/80 lg:flex">
        <SidebarContent {...props} />
      </aside>
    </>
  );
}

function SidebarContent({
  username,
  published,
  newLeads,
  userName,
  userEmail,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/app" onClick={onNavigate} className="group inline-flex items-center gap-2.5">
          <span className="size-1.5 rotate-45 bg-foreground transition-transform duration-500 group-hover:rotate-[225deg]" />
          <span className="font-editorial text-base">Atlas</span>
        </Link>
        <Link
          href={`/${username}${published ? "" : "?preview=1"}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {published ? "View profile" : "Preview draft"}
          <ExternalLink className="size-3" />
        </Link>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-5">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="px-2 pb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
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
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md border-l-2 border-transparent px-2 py-2 text-sm transition-[color,background-color,border-color] duration-300",
                        active
                          ? "border-brand bg-background/55 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-background/35 hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-3.5" strokeWidth={1.6} />
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

      <div className="hairline border-t p-3">
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </>
  );
}

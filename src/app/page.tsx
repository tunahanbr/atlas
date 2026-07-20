import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Database,
  Inbox,
  LayoutDashboard,
  Lock,
  Search,
} from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/profile/reveal";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "A profile that sells",
    description:
      "Hero, services, portfolio, testimonials, experience — structured the way clients actually evaluate you.",
  },
  {
    icon: Briefcase,
    title: "Productized services",
    description:
      "Clear scope, transparent pricing, delivery times. Qualified leads before the first conversation.",
  },
  {
    icon: Inbox,
    title: "Lead inbox",
    description:
      "Inquiries from your contact form land in a clean inbox. No middleman, no commission, no noise.",
  },
  {
    icon: Search,
    title: "SEO built in",
    description:
      "Structured data, Open Graph, semantic HTML and sub-second pages. Be findable by default.",
  },
  {
    icon: Database,
    title: "You own your data",
    description:
      "Open source, MIT licensed, self-hostable with one command. Export everything, anytime.",
  },
  {
    icon: Lock,
    title: "No marketplace",
    description:
      "No rankings, no bidding wars, no platform fees. Your reputation stays yours.",
  },
];

export default async function LandingPage() {
  const session = await auth();

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 bg-background/78 backdrop-blur-md">
        <div className="hairline mx-auto flex h-16 max-w-5xl items-center justify-between border-b px-5 sm:px-6">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <span className="size-1.5 rotate-45 bg-foreground transition-transform duration-500 group-hover:rotate-[225deg]" />
            <span className="font-editorial text-base">Atlas</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              render={
                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
              variant="ghost"
              size="sm"
            >
              GitHub
            </Button>
            <Button
              render={<Link href={session?.user ? "/app" : "/login"} />}
              nativeButton={false}
              size="sm"
            >
              {session?.user ? "Dashboard" : "Get started"}
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 sm:px-6">
        {/* Hero */}
        <section className="grid gap-14 py-28 sm:py-36 md:grid-cols-[1fr_15rem] md:items-end md:gap-16">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                <span className="size-1.5 rotate-45 bg-brand" />
                Open source · MIT licensed
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-editorial mt-7 max-w-3xl text-[2.65rem] leading-[0.98] font-normal tracking-[-0.035em] text-balance sm:text-[3.55rem]">
                A quieter home for independent work.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-xl text-base leading-[1.7] text-quiet text-pretty sm:text-lg">
                Present your work, shape clear offers and receive thoughtful inquiries —
                without giving your identity to another platform.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  render={<Link href={session?.user ? "/app" : "/login"} />}
                  nativeButton={false}
                  size="lg"
                >
                  Create your profile
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  render={<Link href="/lena" target="_blank" />}
                  nativeButton={false}
                  variant="outline"
                  size="lg"
                >
                  See an example
                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.18}>
            <aside className="hairline border-l pl-6">
              <p className="font-editorial text-lg italic leading-snug">
                Your work deserves a place that feels like yours.
              </p>
              <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                No marketplace / No lock-in
              </p>
            </aside>
          </Reveal>
        </section>

        {/* Features */}
        <section className="hairline border-t py-20 sm:py-24">
          <Reveal>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              What matters
            </p>
            <h2 className="font-editorial mt-3 max-w-xl text-3xl font-normal tracking-[-0.025em]">
              Built to win clients, not page views
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Every feature exists to answer one question your visitor has: should I
              hire this person?
            </p>
          </Reveal>
          <div className="hairline mt-12 grid border-y sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.05}>
                <div className="hairline group h-full border-b p-6 transition-colors duration-500 hover:bg-card/50 sm:border-r">
                  <div className="flex items-center justify-between">
                    <feature.icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="font-editorial text-xs italic text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-editorial mt-7 text-lg tracking-[-0.01em]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="hairline border-t py-20 sm:py-24">
          <Reveal>
            <h2 className="font-editorial text-3xl font-normal tracking-[-0.025em]">
              Live in three steps
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-0 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Claim your username",
                description: "Sign in and pick your URL. Thirty seconds, no credit card.",
              },
              {
                step: "02",
                title: "Add your work",
                description:
                  "Services with pricing, projects with outcomes, testimonials with names.",
              },
              {
                step: "03",
                title: "Share your link",
                description:
                  "Put it in your bio, your email signature, your proposals. Watch the inbox.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.08}>
                <li className="hairline border-t py-6 sm:min-h-48 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
                  <p className="font-editorial text-sm italic tabular-nums text-muted-foreground">
                    {item.step}
                  </p>
                  <h3 className="font-editorial mt-5 text-lg tracking-[-0.01em]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Open source CTA */}
        <section className="hairline border-t py-20 sm:py-24">
          <Reveal>
            <h2 className="font-editorial max-w-xl text-3xl font-normal tracking-[-0.025em]">
              Free forever. Self-hostable. Yours.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-[1.7] text-muted-foreground">
              MIT licensed. One Docker command and Atlas runs on your own
              infrastructure — your data never touches ours.
            </p>
            <div className="mt-8 flex gap-3">
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                size="lg"
              >
                Get started
              </Button>
              <Button
                render={
                  <Link href="https://github.com" target="_blank" rel="noopener noreferrer" />
                }
                nativeButton={false}
                variant="outline"
                size="lg"
              >
                Star on GitHub
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="hairline border-t py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted-foreground">
          <p>Atlas — the open-source home for independent professionals.</p>
          <p>MIT License</p>
        </div>
      </footer>
    </>
  );
}

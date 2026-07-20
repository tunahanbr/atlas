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
      <nav className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Atlas
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
              className="rounded-lg"
            >
              {session?.user ? "Dashboard" : "Get started"}
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        {/* Hero */}
        <section className="py-32 text-center sm:py-40">
          <Reveal>
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              Open source · MIT licensed
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              The open-source home for independent professionals
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Create a professional website in under 10 minutes. Showcase your work,
              sell your services, receive qualified client inquiries — and own
              everything.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button
                render={<Link href={session?.user ? "/app" : "/login"} />}
                nativeButton={false}
                size="lg"
                className="rounded-xl"
              >
                Create your profile
                <ArrowRight className="size-4" />
              </Button>
              <Button
                render={<Link href="/lena" target="_blank" />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="rounded-xl"
              >
                View a live example
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </Reveal>
        </section>

        {/* Features */}
        <section className="border-t py-24">
          <Reveal>
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              Built to win clients, not page views
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
              Every feature exists to answer one question your visitor has: should I
              hire this person?
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.05}>
                <div className="h-full rounded-xl border bg-card p-6">
                  <feature.icon className="size-5 text-muted-foreground" />
                  <h3 className="mt-4 font-medium tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t py-24">
          <Reveal>
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              Live in three steps
            </h2>
          </Reveal>
          <ol className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-3">
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
                <li className="text-center">
                  <p className="text-sm font-medium tabular-nums text-muted-foreground">
                    {item.step}
                  </p>
                  <h3 className="mt-2 font-medium tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Open source CTA */}
        <section className="border-t py-24 text-center">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight">
              Free forever. Self-hostable. Yours.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              MIT licensed. One Docker command and Atlas runs on your own
              infrastructure — your data never touches ours.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                size="lg"
                className="rounded-xl"
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
                className="rounded-xl"
              >
                Star on GitHub
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted-foreground">
          <p>Atlas — the open-source home for independent professionals.</p>
          <p>MIT License</p>
        </div>
      </footer>
    </>
  );
}

import { PrismaClient, type Prisma } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  await db.$transaction(seedDemo);
  console.log("Seed complete: profile @lena for user lena@example.com");
}

async function seedDemo(tx: Prisma.TransactionClient) {
  const user = await tx.user.upsert({
    where: { email: "lena@example.com" },
    update: {},
    create: {
      email: "lena@example.com",
      name: "Lena Hart",
      image: null,
    },
  });

  const profile = await tx.profile.upsert({
    where: { username: "lena" },
    update: {},
    create: {
      userId: user.id,
      username: "lena",
      displayName: "Lena Hart",
      profileLabel: "Independent professional",
      headline: "Senior Product Engineer — I design and build web products that win clients",
      bio: "I'm a product engineer with 10+ years of experience shipping web applications for startups and scale-ups. I work across the stack — from database schema to pixel-perfect UI — and I care about one thing: software that moves your business forward.\n\nPreviously lead engineer at two VC-backed startups. Today I work with a small number of selected clients on product strategy, architecture and hands-on delivery.",
      location: "Vienna, Austria",
      availability: "AVAILABLE",
      availabilityNote: "Booking projects for Q3 2026",
      bookingUrl: "https://cal.com/lena-hart",
      website: "https://lenahart.dev",
      theme: "system",
      seoTitle: "Lena Hart — Senior Product Engineer & Consultant",
      seoDescription:
        "Freelance product engineer for web applications. Product strategy, architecture and delivery for startups. Based in Vienna, working worldwide.",
    },
  });

  // Reset only the demo profile's presentation data. Running the seed repeatedly
  // is deterministic, while leads and account/session data remain untouched.
  await tx.service.deleteMany({ where: { profileId: profile.id } });
  await tx.project.deleteMany({ where: { profileId: profile.id } });
  await tx.testimonial.deleteMany({ where: { profileId: profile.id } });
  await tx.experience.deleteMany({ where: { profileId: profile.id } });
  await tx.skill.deleteMany({ where: { profileId: profile.id } });
  await tx.certification.deleteMany({ where: { profileId: profile.id } });
  await tx.socialLink.deleteMany({ where: { profileId: profile.id } });

  await tx.service.createMany({
    data: [
      {
        profileId: profile.id,
        title: "Product MVP in 6 weeks",
        description:
          "From idea to a production-ready web application. Scoping, design, development, deployment and handover. You get a working product your first users can pay for — not a prototype.",
        priceType: "FIXED",
        priceCents: 2400000,
        currency: "EUR",
        deliveryDays: 42,
        technologies: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
        order: 0,
      },
      {
        profileId: profile.id,
        title: "Technical Audit & Roadmap",
        description:
          "A deep review of your codebase, architecture and delivery process. You receive a written report with prioritized, actionable recommendations your team can execute immediately.",
        priceType: "FIXED",
        priceCents: 450000,
        currency: "EUR",
        deliveryDays: 10,
        technologies: ["Architecture", "Performance", "Code Review"],
        order: 1,
      },
      {
        profileId: profile.id,
        title: "Embedded Senior Engineer",
        description:
          "I join your team part-time to unblock delivery: architecture decisions, code review, mentoring and hands-on feature work. Ideal for teams between founding and first senior hire.",
        priceType: "STARTING_AT",
        priceCents: 12000,
        currency: "EUR",
        deliveryDays: null,
        technologies: ["React", "Node.js", "AWS", "CI/CD"],
        order: 2,
      },
    ],
  });

  await tx.project.createMany({
    data: [
      {
        profileId: profile.id,
        slug: "atlas-billing",
        title: "Atlas Billing Platform",
        summary:
          "Subscription billing platform processing €2M+/month for a B2B SaaS. Migrated from a legacy monolith to event-driven services without downtime.",
        description:
          "The client's legacy billing system blocked every pricing change for weeks. I designed and led the migration to an event-driven architecture with Stripe at the core.\n\nResult: pricing experiments now ship in hours, failed-payment recovery improved by 34%, and finance closes the month in one day instead of five.",
        imageUrl: null,
        repoUrl: null,
        liveUrl: "https://example.com",
        technologies: ["Next.js", "PostgreSQL", "Stripe", "Kafka"],
        year: 2025,
        featured: true,
        order: 0,
      },
      {
        profileId: profile.id,
        slug: "nordwind-commerce",
        title: "Nordwind Commerce",
        summary:
          "Headless e-commerce storefront with sub-second page loads across 14 markets. Core Web Vitals in the green, conversion up 18%.",
        description:
          "Rebuilt a slow monolithic storefront as a headless Next.js application with aggressive edge caching and a design system shared across brands.",
        repoUrl: null,
        liveUrl: "https://example.com",
        technologies: ["Next.js", "Shopify", "Vercel", "Tailwind CSS"],
        year: 2024,
        featured: true,
        order: 1,
      },
      {
        profileId: profile.id,
        slug: "fleetpulse",
        title: "Fleetpulse Telemetry",
        summary:
          "Real-time telemetry dashboard for 4,000+ connected vehicles. Streaming ingestion, alerting and a live map operations teams actually enjoy using.",
        description:
          "Designed the ingestion pipeline and the real-time dashboard for a logistics fleet. WebSocket streaming, time-series storage and an alerting rule engine.",
        repoUrl: "https://github.com/lenahart/fleetpulse",
        liveUrl: null,
        technologies: ["React", "WebSockets", "TimescaleDB", "Go"],
        year: 2024,
        featured: false,
        order: 2,
      },
      {
        profileId: profile.id,
        slug: "opennotes",
        title: "Opennotes",
        summary:
          "Open-source note-taking with end-to-end encryption. 4.2k GitHub stars, built as a weekend project that grew a community.",
        description:
          "A side project exploring local-first sync and end-to-end encryption. Grew to 4.2k stars and a small contributor community.",
        repoUrl: "https://github.com/lenahart/opennotes",
        liveUrl: "https://opennotes.example.com",
        technologies: ["TypeScript", "CRDTs", "SQLite", "Tauri"],
        year: 2023,
        featured: false,
        order: 3,
      },
    ],
  });

  await tx.testimonial.createMany({
    data: [
      {
        profileId: profile.id,
        authorName: "Markus Stein",
        authorRole: "CEO",
        authorCompany: "Nordwind",
        content:
          "Lena is the rare engineer who understands business. She challenged our roadmap, cut scope we didn't need, and shipped a storefront that increased conversion by 18%. Best money we spent last year.",
        order: 0,
      },
      {
        profileId: profile.id,
        authorName: "Sarah Kim",
        authorRole: "CTO",
        authorCompany: "Atlas",
        content:
          "The billing migration was the highest-risk project in the company's history and Lena delivered it without a single minute of downtime. Her written communication alone is worth the rate.",
        order: 1,
      },
      {
        profileId: profile.id,
        authorName: "Daniel Weber",
        authorRole: "Founder",
        authorCompany: "Fleetpulse",
        content:
          "We hired Lena for three months and kept her for a year. She levelled up our whole team — our juniors now review code the way she taught them.",
        order: 2,
      },
    ],
  });

  await tx.experience.createMany({
    data: [
      {
        profileId: profile.id,
        company: "Independent",
        role: "Product Engineer & Consultant",
        description:
          "Product strategy, architecture and hands-on delivery for selected clients across Europe.",
        startDate: new Date("2022-03-01"),
        current: true,
        order: 0,
      },
      {
        profileId: profile.id,
        company: "Loopwork (acquired)",
        role: "Lead Engineer",
        description:
          "Led a team of 6 building a B2B automation platform from seed to Series B and acquisition.",
        startDate: new Date("2018-06-01"),
        endDate: new Date("2022-02-01"),
        order: 1,
      },
      {
        profileId: profile.id,
        company: "Messagebird",
        role: "Senior Software Engineer",
        description: "Core messaging APIs serving 15k+ business customers.",
        startDate: new Date("2015-09-01"),
        endDate: new Date("2018-05-01"),
        order: 2,
      },
    ],
  });

  await tx.skill.createMany({
    data: [
      { profileId: profile.id, name: "TypeScript", category: "Languages", order: 0 },
      { profileId: profile.id, name: "Go", category: "Languages", order: 1 },
      { profileId: profile.id, name: "SQL", category: "Languages", order: 2 },
      { profileId: profile.id, name: "Next.js", category: "Frameworks", order: 3 },
      { profileId: profile.id, name: "React", category: "Frameworks", order: 4 },
      { profileId: profile.id, name: "Node.js", category: "Frameworks", order: 5 },
      { profileId: profile.id, name: "PostgreSQL", category: "Infrastructure", order: 6 },
      { profileId: profile.id, name: "AWS", category: "Infrastructure", order: 7 },
      { profileId: profile.id, name: "Docker", category: "Infrastructure", order: 8 },
      { profileId: profile.id, name: "Kafka", category: "Infrastructure", order: 9 },
      { profileId: profile.id, name: "Product Strategy", category: "Consulting", order: 10 },
      { profileId: profile.id, name: "Technical Due Diligence", category: "Consulting", order: 11 },
    ],
  });

  await tx.certification.createMany({
    data: [
      {
        profileId: profile.id,
        name: "AWS Certified Solutions Architect — Professional",
        issuer: "Amazon Web Services",
        year: 2023,
      },
      {
        profileId: profile.id,
        name: "Certified Kubernetes Application Developer",
        issuer: "CNCF",
        year: 2022,
      },
    ],
  });

  await tx.socialLink.createMany({
    data: [
      { profileId: profile.id, label: "GitHub", url: "https://github.com/lenahart", order: 0 },
      { profileId: profile.id, label: "LinkedIn", url: "https://linkedin.com/in/lenahart", order: 1 },
      { profileId: profile.id, label: "X", url: "https://x.com/lenahart", order: 2 },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

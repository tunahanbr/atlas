# Atlas

The open-source home for independent professionals.

Create a professional website in under 10 minutes. Showcase your work, sell
productized services, and receive qualified client inquiries — without
marketplace fees, rankings, or platform lock-in.

MIT licensed. Self-hostable. You own your data.

## Features

- **Public profile** — hero, availability badge, services with pricing,
  portfolio with case studies, testimonials, experience, skills, certifications
- **Lead inbox** — contact form submissions land in a clean inbox; reply
  directly by email
- **Dashboard** — manage everything from a calm, Linear-inspired interface
- **SEO-first** — structured data (JSON-LD), Open Graph, sitemap, semantic HTML
- **Dark mode** — system, light or dark default per profile
- **Open source** — MIT license, API-friendly architecture, self-host in one command

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui ·
Framer Motion · PostgreSQL · Prisma · Auth.js · Docker

## Quickstart (development)

Requirements: Node 24+, pnpm, Docker (for PostgreSQL).

```bash
git clone <repo> && cd atlas
pnpm install
cp .env.example .env        # then set AUTH_SECRET: openssl rand -base64 32
docker compose up -d        # starts PostgreSQL on :5432
pnpm db:migrate             # creates the schema
pnpm db:seed                # optional demo profile at /lena
pnpm dev                    # http://localhost:3000
```

Without GitHub OAuth configured, a development-only login is enabled — any
email creates an account. For production, create a GitHub OAuth app and set
`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`.

## Self-hosting (production)

```bash
export AUTH_SECRET=$(openssl rand -base64 32)
docker compose -f docker-compose.prod.yml up -d --build
```

Atlas runs at http://localhost:3000. Database migrations apply automatically
on container start. Put a reverse proxy (Caddy, nginx, Traefik) with TLS in
front and set `AUTH_URL` / `NEXT_PUBLIC_APP_URL` to your public URL.

## Useful commands

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `pnpm dev`        | Start dev server                 |
| `pnpm build`      | Production build                 |
| `pnpm lint`       | ESLint                           |
| `pnpm test`       | Unit tests (vitest)              |
| `pnpm db:migrate` | Apply dev migrations             |
| `pnpm db:seed`    | Seed demo profile                |
| `pnpm db:studio`  | Prisma Studio                    |

## Project structure

```
src/
  app/                 routes: / (landing), /[username] (profile),
                       /app/* (dashboard), /login, /setup, /api/auth
  components/
    ui/                shadcn/ui primitives
    profile/           public profile sections
    dashboard/         dashboard managers & shared widgets
    onboarding/        setup wizard
  server/
    actions/           server actions (mutations, zod-validated)
    queries.ts         cached data access for public pages
    db.ts              Prisma client
  lib/                 validations (zod), formatting, constants
prisma/                schema, migrations, seed
```

## Roadmap

- **Now**: profiles, services, portfolio, testimonials, lead inbox
- **Next**: custom domains, analytics, themes, API + webhooks
- **Later**: CRM, proposals, contracts, invoicing, client portal, plugins

## Contributing

Issues and PRs welcome. Keep the design calm, the code boring, and the
bundle small.

## License

MIT — see [LICENSE](./LICENSE).

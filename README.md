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
  directly by email, manage the sales pipeline, schedule follow-ups and add notes
- **Privacy-friendly analytics** — daily views, interest and conversion metrics
  without cookies, IP addresses or visitor profiles
- **Custom domains** — DNS ownership verification and host-based profile routing
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
export AUTH_GITHUB_ID=<your-github-oauth-client-id>
export AUTH_GITHUB_SECRET=<your-github-oauth-client-secret>
docker compose -f docker-compose.prod.yml up -d --build
```

Atlas runs at http://localhost:3000. Database migrations apply automatically
on container start. Put a reverse proxy (Caddy, nginx, Traefik) with TLS in
front, ensure it replaces untrusted forwarding headers, and set `AUTH_URL` /
`NEXT_PUBLIC_APP_URL` to your public URL. GitHub OAuth is required in production;
the email-only development login is never registered in a production build.

### Lead notifications

New leads are always stored before delivery is attempted. Configure email with
`SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` and, when required, `SMTP_USER` /
`SMTP_PASS`. The notification is sent to the profile owner's account email and
uses the lead's address as `Reply-To`.

For integrations, set `LEAD_WEBHOOK_URL` and `LEAD_WEBHOOK_SECRET`. Atlas sends
`lead.created` JSON payloads with an `X-Atlas-Signature: sha256=<hmac>` header.
Webhook delivery requires HTTPS in production and does not follow redirects.

### Custom domains

Set `CUSTOM_DOMAIN_CNAME` to the public hostname serving your Atlas instance.
Users add domains under Settings, create the displayed CNAME and TXT records,
then click Verify. Your reverse proxy must terminate TLS for every connected
domain and forward the original `Host` header to Atlas.

Analytics are stored as daily aggregate counters only. Atlas does not persist
visitor IPs, cookies, user agents or raw analytics events.

## Useful commands

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `pnpm dev`        | Start dev server                 |
| `pnpm build`      | Production build                 |
| `pnpm lint`       | ESLint                           |
| `pnpm test`       | Unit tests (vitest)              |
| `pnpm test:integration` | Database isolation tests   |
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
- **Now**: profiles, services, portfolio, analytics, custom domains, lead CRM
- **Next**: proposals, contracts and invoicing
- **Later**: client portal and plugins

## Contributing

Issues and PRs welcome. Keep the design calm, the code boring, and the
bundle small.

## License

MIT — see [LICENSE](./LICENSE).

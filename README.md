# Atlas

The open-source home for independent professionals.

Create a professional website in under 10 minutes. Showcase your work, sell
productized services, and receive qualified client inquiries — without
marketplace fees, rankings, or platform lock-in.

MIT licensed. Self-hostable. You own your data.

## Features

- **Public profile** — hero, availability badge, services with pricing,
  portfolio with case studies, testimonials, experience, skills, certifications
- **Draft and preview workflow** — keep an entire profile private, preview it as
  its owner, then publish when it is ready
- **Managed media** — validated portrait and project-image uploads with Supabase Storage
- **Lead inbox** — contact form submissions land in a clean inbox; reply
  directly by email, manage the sales pipeline, schedule follow-ups and add notes
- **Privacy-friendly analytics** — daily views, interest and conversion metrics
  without cookies, IP addresses or visitor profiles
- **Custom domains** — DNS ownership verification and host-based profile routing
- **Dashboard** — manage everything from a calm, editorial interface with drag-and-drop ordering
- **SEO-first** — structured data (JSON-LD), generated Open Graph cards, sitemap, semantic HTML
- **Data controls** — complete JSON export and permanent account deletion
- **Dark mode** — system, light or dark default per profile
- **Open source** — MIT license, API-friendly architecture, self-host in one command

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui ·
Framer Motion · PostgreSQL · Prisma · Supabase Auth/Storage · Auth.js fallback · Docker

## Quickstart (development)

Requirements: Node 24+, pnpm, Docker (for PostgreSQL).

```bash
git clone https://github.com/tunahanbr/atlas.git && cd atlas
pnpm install
cp .env.example .env        # then set AUTH_SECRET: openssl rand -base64 32
docker compose up -d        # starts PostgreSQL on :5432
pnpm db:migrate             # creates the schema
pnpm db:seed                # optional demo profile at /lena
pnpm dev                    # http://localhost:3000
```

Without Supabase configured, a development-only login is enabled — any email
creates a local account. Production should use Supabase Magic Link by setting
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and the
server-only `SUPABASE_SERVICE_ROLE_KEY`. Existing Auth.js accounts are linked by
normalized email on first Supabase sign-in. Legacy GitHub OAuth remains available
for self-hosters that do not configure Supabase.

## Self-hosting (production)

```bash
export AUTH_SECRET=$(openssl rand -base64 32)
export ANALYTICS_SALT=$(openssl rand -base64 32)
export NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
export SUPABASE_SERVICE_ROLE_KEY=<your-server-only-service-role-key>
docker compose -f docker-compose.prod.yml up -d --build
```

Atlas runs at http://localhost:3000. Database migrations apply automatically
on container start. Put a reverse proxy (Caddy, nginx, Traefik) with TLS in
front, ensure it replaces untrusted forwarding headers, and set `AUTH_URL` /
`NEXT_PUBLIC_APP_URL` to your public URL. Add
`https://your-host/auth/callback` to the Supabase redirect allow-list. The
email-only local development login is never registered in a production build.

### Supabase setup

Magic Link works once Email authentication is enabled. To offer GitHub too,
configure the GitHub provider in Supabase and set
`SUPABASE_AUTH_GITHUB_ENABLED=true`. Atlas creates the public media bucket on
the first validated upload using the server-only service role key. Images are
limited to JPEG, PNG or WebP files up to 5 MB.

### Lead notifications

New leads are always stored before delivery is attempted. Configure email with
`SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` and, when required, `SMTP_USER` /
`SMTP_PASS`. The notification is sent to the profile owner's account email and
uses the lead's address as `Reply-To`.

For integrations, set `LEAD_WEBHOOK_URL` and `LEAD_WEBHOOK_SECRET`. Atlas sends
`lead.created` JSON payloads with an `X-Atlas-Signature: sha256=<hmac>` header.
Webhook delivery requires HTTPS in production and does not follow redirects.
Every lead creates a durable notification job. Configure a scheduler to call
`POST /api/jobs/notifications` with `Authorization: Bearer $CRON_SECRET`; failed
channels retry with exponential backoff up to eight attempts.

### Custom domains

Set `CUSTOM_DOMAIN_CNAME` to the public hostname serving your Atlas instance.
Users add domains under Settings, create the displayed CNAME and TXT records,
then click Verify. Your reverse proxy must terminate TLS for every connected
domain and forward the original `Host` header to Atlas.

Analytics count each visitor once per event, target and UTC day. Atlas creates a
rotating one-way hash in memory and discards the source address immediately; raw
IP addresses, cookies and cross-day visitor profiles are never stored.

### Backups and deletion

Account owners can download a complete JSON export or permanently remove their
account under Settings. Operational PostgreSQL and Storage backup/restore steps
are documented in [docs/BACKUP.md](./docs/BACKUP.md).

## Useful commands

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `pnpm dev`        | Start dev server                 |
| `pnpm build`      | Production build                 |
| `pnpm lint`       | ESLint                           |
| `pnpm test`       | Unit tests (vitest)              |
| `pnpm test:integration` | Database isolation tests   |
| `pnpm test:e2e`    | Desktop/mobile Playwright and accessibility checks |
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

## Scope

Atlas currently covers profiles, services, portfolio, testimonials, analytics,
custom domains, media, lead CRM and data portability. Proposals, contracts,
invoicing and a client portal remain intentionally outside the current product.

## Contributing

Issues and PRs welcome. Keep the design calm, the code boring, and the
bundle small.

## License

MIT — see [LICENSE](./LICENSE).

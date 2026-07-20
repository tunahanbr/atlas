# Backup and restore

Atlas keeps domain data in PostgreSQL and uploaded images in the configured
Supabase Storage bucket (`atlas-media` by default). Back up both on the same
schedule and test restores regularly.

## PostgreSQL

Create a compressed backup:

```bash
pg_dump --format=custom --no-owner --file=atlas.dump "$DATABASE_URL"
```

Restore into an empty database, then verify migrations:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$RESTORE_DATABASE_URL" atlas.dump
DATABASE_URL="$RESTORE_DATABASE_URL" pnpm db:deploy
```

For Docker Compose, run `pg_dump` inside the database container or expose a
restricted maintenance connection. Encrypt backups, keep at least one copy in
a separate failure domain, and define retention according to your legal needs.

## Supabase Storage

Use Supabase's platform backup/export facilities or periodically mirror every
object in the configured media bucket while preserving object paths. Database
backups do not include Storage objects. After a restore, keep the same project
URL and bucket name or update stored public URLs in `Profile.avatarUrl`,
`Project.imageUrl`, and testimonial avatar fields.

## Restore drill

At least quarterly, restore into an isolated environment, run `pnpm db:deploy`,
open a published profile and project image, sign in, and export an account from
Settings. Record the recovery time and any manual steps.

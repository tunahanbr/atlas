import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { getLeadNotificationStatus } from "@/server/lead-notifications";
import { PageHeader } from "@/components/dashboard/shared";
import { SeoForm } from "@/components/dashboard/seo-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { seoTitle: true, seoDescription: true, username: true, createdAt: true },
  });
  if (!profile) redirect("/setup");
  const notificationStatus = getLeadNotificationStatus();

  return (
    <>
      <PageHeader title="Settings" description="SEO, account and instance configuration." />

      <div className="space-y-6">
        <SeoForm seoTitle={profile.seoTitle} seoDescription={profile.seoDescription} />

        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-medium tracking-tight">Lead notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Delivery channels configured for new inquiries on this instance.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <NotificationChannel
              label="Email"
              enabled={notificationStatus.email}
              hint="SMTP_HOST and SMTP_FROM"
            />
            <NotificationChannel
              label="Webhook"
              enabled={notificationStatus.webhook}
              hint="LEAD_WEBHOOK_URL and LEAD_WEBHOOK_SECRET"
            />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-medium tracking-tight">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{session.user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Profile URL</dt>
              <dd className="font-medium">atlas.rocks/{profile.username}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-medium">
                {profile.createdAt.toLocaleDateString("en", {
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-dashed p-6">
          <h2 className="font-medium tracking-tight text-muted-foreground">Custom domain</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Point your own domain at this profile. Coming in the next release — the
            routing layer already supports it.
          </p>
        </section>
      </div>
    </>
  );
}

function NotificationChannel({
  label,
  enabled,
  hint,
}: {
  label: string;
  enabled: boolean;
  hint: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-medium">{label}</p>
        {!enabled ? <p className="text-xs text-muted-foreground">Configure {hint}</p> : null}
      </div>
      <span
        className={
          enabled
            ? "rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
            : "rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
        }
      >
        {enabled ? "Active" : "Not configured"}
      </span>
    </div>
  );
}

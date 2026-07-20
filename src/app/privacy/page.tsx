import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" updated="20 July 2026">
    <p>Atlas stores the account, profile, portfolio, inquiries and settings needed to provide the service. Passwords are not stored by Atlas; authentication is handled by the configured identity provider.</p>
    <h2>Public and private data</h2><p>Published profile content is public. Draft profiles and dashboard data are available only to the signed-in owner. Inquiry details are shared with that profile owner.</p>
    <h2>Analytics</h2><p>Atlas records daily aggregate page and interaction counts. It does not create visitor profiles or store raw visitor IP addresses, user agents or analytics cookies.</p>
    <h2>Processors and retention</h2><p>Your instance may use Supabase for authentication and media storage, PostgreSQL for application data, SMTP for email and a configured webhook endpoint. Data remains until the account owner deletes it or the instance operator applies a documented retention policy.</p>
    <h2>Your choices</h2><p>Account owners can export their application data and permanently delete their account in Settings. For access or correction requests that cannot be completed in the product, contact the operator of this Atlas instance.</p>
  </LegalPage>;
}

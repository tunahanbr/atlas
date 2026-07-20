import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return <LegalPage title="Terms of use" updated="20 July 2026">
    <p>Atlas is open-source software for publishing professional profiles and receiving inquiries. If you use a hosted instance, its operator is responsible for availability, support and any additional commercial terms.</p>
    <h2>Your content</h2><p>You retain ownership of your content. You grant the instance permission to store and display content only as needed to operate Atlas. Do not upload material you lack the right to use.</p>
    <h2>Acceptable use</h2><p>Do not use Atlas for unlawful activity, impersonation, malware, spam, harassment or attempts to interfere with the service or other accounts.</p>
    <h2>Service and liability</h2><p>The software is provided without warranties under its open-source license. Hosted availability may change, and owners should keep exports or backups appropriate to their needs.</p>
    <h2>Termination</h2><p>You may delete your account at any time. An instance operator may restrict abusive use, subject to applicable law and any separate agreement.</p>
  </LegalPage>;
}

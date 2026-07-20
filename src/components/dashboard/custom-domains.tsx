"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Copy, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  addCustomDomain,
  deleteCustomDomain,
  verifyCustomDomain,
} from "@/server/actions/domains";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Domain = {
  id: string;
  hostname: string;
  verificationToken: string;
  status: "PENDING" | "VERIFIED";
};

export function CustomDomains({ domains, cnameTarget }: { domains: Domain[]; cnameTarget: string }) {
  const router = useRouter();
  const [hostname, setHostname] = useState("");
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? "Domain update failed");
        return;
      }
      toast.success(success);
      setHostname("");
      router.refresh();
    });
  }

  function copy(value: string) {
    void navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="font-medium tracking-tight">Custom domains</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Serve your public profile from up to five domains. Atlas verifies ownership with DNS.
      </p>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          run(() => addCustomDomain(hostname), "Domain added");
        }}
      >
        <Input
          value={hostname}
          onChange={(event) => setHostname(event.target.value)}
          placeholder="portfolio.example.com"
          aria-label="Custom domain hostname"
          required
        />
        <Button type="submit" disabled={pending || !hostname.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Add domain
        </Button>
      </form>

      {domains.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {domains.map((domain) => {
            const txtName = `_atlas-challenge.${domain.hostname}`;
            const txtValue = `atlas-verification=${domain.verificationToken}`;
            return (
              <li key={domain.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{domain.hostname}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      {domain.status === "VERIFIED" ? (
                        <><CheckCircle2 className="size-3.5 text-success" /> Ownership verified</>
                      ) : (
                        "Waiting for DNS verification"
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {domain.status === "PENDING" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => run(() => verifyCustomDomain(domain.id), "Domain verified")}
                      >
                        <RefreshCw className="size-3.5" /> Verify
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${domain.hostname}`}
                      disabled={pending}
                      onClick={() => run(() => deleteCustomDomain(domain.id), "Domain removed")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {domain.status === "PENDING" ? (
                  <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                    <DnsValue label="TXT name" value={txtName} onCopy={copy} />
                    <DnsValue label="TXT value" value={txtValue} onCopy={copy} />
                    <DnsValue label="CNAME name" value={domain.hostname} onCopy={copy} />
                    <DnsValue label="CNAME target" value={cnameTarget} onCopy={copy} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

function DnsValue({ label, value, onCopy }: { label: string; value: string; onCopy: (value: string) => void }) {
  return (
    <div className="min-w-0 rounded-lg bg-muted p-3">
      <p className="text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate">{value}</code>
        <button type="button" onClick={() => onCopy(value)} aria-label={`Copy ${label}`}>
          <Copy className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

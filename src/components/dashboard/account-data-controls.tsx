"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";

import { deleteAccount } from "@/server/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountDataControls({ username }: { username: string }) {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="font-medium tracking-tight">Your data</h2>
      <p className="mt-1 text-sm text-muted-foreground">Take a complete JSON copy at any time. Account deletion permanently removes profile, leads and uploaded media.</p>
      <Button render={<Link href="/app/settings/export" />} nativeButton={false} variant="outline" className="mt-4">
        <Download className="size-4" /> Export my data
      </Button>
      <form action={action} className="mt-7 rounded-md bg-destructive/5 p-4">
        <Label htmlFor="confirmation">Delete account</Label>
        <p className="mt-1 text-xs text-muted-foreground">Type <strong>{username}</strong> to confirm. This cannot be undone.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input id="confirmation" name="confirmation" autoComplete="off" placeholder={username} required />
          <Button type="submit" variant="destructive" disabled={pending} className="shrink-0">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Delete permanently
          </Button>
        </div>
        {state?.error ? <p className="mt-2 text-xs text-destructive" role="alert">{state.error}</p> : null}
      </form>
    </section>
  );
}

"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { submitLead, type LeadFormState } from "@/server/actions/leads";
import { BUDGET_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: LeadFormState = { status: "idle" };

export function LeadForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState(submitLead, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md bg-card/50 py-12 text-center">
        <CheckCircle2 className="size-8 text-success" />
        <p className="font-editorial text-xl">Your note is on its way</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thanks for the context. You&apos;ll hear back within 1–2 business days.
        </p>
      </div>
    );
  }

  const errors = state.status === "error" ? state.errors : {};

  return (
    <div>
      <div className="mb-7 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <h3 className="font-editorial text-2xl tracking-[-0.02em]">Start with a little context.</h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            A few concrete details make the first reply much more useful. No polished brief needed.
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Usually replies in 1–2 days
        </p>
      </div>
      <form action={action} className="rounded-md bg-card/45 p-6 sm:p-8">
      <input type="hidden" name="username" value={username} />
      <div className="absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
        <label htmlFor="lead-contact-url">Leave this field empty</label>
        <input
          id="lead-contact-url"
          name="contact_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {errors._form ? (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {errors._form[0]}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lead-name">Name</Label>
          <Input id="lead-name" name="name" placeholder="Jane Cooper" required />
          {errors.name ? <FieldError message={errors.name[0]} /> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-email">Email</Label>
          <Input id="lead-email" name="email" type="email" placeholder="jane@company.com" required />
          {errors.email ? <FieldError message={errors.email[0]} /> : null}
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <Label htmlFor="lead-budget">Budget (optional)</Label>
        <Select name="budget">
          <SelectTrigger id="lead-budget" className="w-full">
            <SelectValue placeholder="Select a range" />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 space-y-1.5">
          <Label htmlFor="lead-message">What are you trying to change?</Label>
        <Textarea
          id="lead-message"
          name="message"
          rows={5}
          placeholder="The situation today, the outcome you want, and any timing that matters."
          required
        />
        {errors.message ? <FieldError message={errors.message[0]} /> : null}
      </div>
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Send project brief
      </Button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Direct to the profile owner. Your details are never shared.
      </p>
      </form>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

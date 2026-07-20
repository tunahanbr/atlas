"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";

import { upsertService, deleteService } from "@/server/actions/entities";
import { formatDelivery, formatPrice } from "@/lib/format";
import { useUpsert, DeleteButton, EmptyState } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";

type Service = {
  id: string;
  title: string;
  description: string;
  priceType: "FIXED" | "STARTING_AT" | "ON_REQUEST";
  priceCents: number | null;
  currency: string;
  deliveryDays: number | null;
  technologies: string[];
  published: boolean;
};

export function ServicesManager({ services }: { services: Service[] }) {
  const { open, setOpen, pending, submit } = useUpsert(upsertService);
  const [editing, setEditing] = useState<Service | null>(null);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const priceEuros = String(fd.get("price") ?? "").trim();
    const delivery = String(fd.get("deliveryDays") ?? "").trim();
    submit(editing?.id ?? null, {
      title: fd.get("title"),
      description: fd.get("description"),
      priceType: fd.get("priceType"),
      priceCents:
        fd.get("priceType") === "ON_REQUEST" || !priceEuros
          ? null
          : Math.round(parseFloat(priceEuros) * 100),
      currency: String(fd.get("currency") || "EUR").toUpperCase(),
      deliveryDays: delivery ? parseInt(delivery, 10) : null,
      technologies: String(fd.get("technologies") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      published: fd.get("published") === "on",
    });
  }

  return (
    <>
      {services.length > 0 ? (
        <div className="flex justify-end">
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Add service
          </Button>
        </div>
      ) : null}

      {services.length === 0 ? (
        <EmptyState
          title="Turn one repeat request into a clear offer"
          description="Start with a problem clients already ask you to solve. Give it a concrete outcome, a realistic timeline and a price signal."
        >
          <Button onClick={openNew} variant="outline">
            <Plus className="size-4" />
            Create your first offer
          </Button>
        </EmptyState>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {services.map((service) => (
            <li key={service.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium tracking-tight">{service.title}</p>
                  {!service.published ? (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      Draft
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatPrice(service.priceType, service.priceCents, service.currency)}
                  {service.deliveryDays
                    ? ` · ${formatDelivery(service.deliveryDays)}`
                    : ""}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(service)}>
                <Pencil className="size-4" />
              </Button>
              <DeleteButton id={service.id} action={deleteService} label={service.title} />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100svh-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service" : "New service"}</DialogTitle>
            <DialogDescription>
              Make it easy for the right client to recognize their problem and take the next step.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Offer title</Label>
              <Input id="title" name="title" defaultValue={editing?.title} required maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">What the client gets</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={editing?.description}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="priceType">Pricing</Label>
                <Select name="priceType" defaultValue={editing?.priceType ?? "STARTING_AT"}>
                  <SelectTrigger id="priceType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STARTING_AT">Starting at</SelectItem>
                    <SelectItem value="FIXED">Fixed price</SelectItem>
                    <SelectItem value="ON_REQUEST">On request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="4500"
                  defaultValue={editing?.priceCents ? editing.priceCents / 100 : ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  defaultValue={editing?.currency ?? "EUR"}
                  maxLength={3}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="deliveryDays">Delivery time (days)</Label>
                <Input
                  id="deliveryDays"
                  name="deliveryDays"
                  type="number"
                  min="1"
                  placeholder="14"
                  defaultValue={editing?.deliveryDays ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="technologies">Expertise tags (comma-separated)</Label>
                <Input
                  id="technologies"
                  name="technologies"
                  placeholder="Next.js, PostgreSQL"
                  defaultValue={editing?.technologies.join(", ")}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch name="published" defaultChecked={editing?.published ?? true} />
              Published
            </label>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Create service"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

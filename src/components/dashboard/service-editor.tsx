"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Eye, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { upsertService } from "@/server/actions/entities";
import { formatDelivery, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PriceType = "FIXED" | "STARTING_AT" | "ON_REQUEST";
type Service = { id: string; title: string; description: string; priceType: PriceType; priceCents: number | null; currency: string; deliveryDays: number | null; technologies: string[]; published: boolean };

export function ServiceEditor({ service }: { service: Service | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(service?.title ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [priceType, setPriceType] = useState<PriceType>(service?.priceType ?? "STARTING_AT");
  const [price, setPrice] = useState(service?.priceCents ? String(service.priceCents / 100) : "");
  const [currency, setCurrency] = useState(service?.currency ?? "EUR");
  const [deliveryDays, setDeliveryDays] = useState(service?.deliveryDays?.toString() ?? "");
  const [technologies, setTechnologies] = useState(service?.technologies.join(", ") ?? "");
  const [published, setPublished] = useState(service?.published ?? true);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await upsertService(service?.id ?? null, {
        title,
        description,
        priceType,
        priceCents: priceType === "ON_REQUEST" || !price ? null : Math.round(parseFloat(price) * 100),
        currency: currency.toUpperCase(),
        deliveryDays: deliveryDays ? parseInt(deliveryDays, 10) : null,
        technologies: technologies.split(",").map((technology) => technology.trim()).filter(Boolean),
        published,
      });
      if (result.ok) {
        toast.success(service ? "Service updated" : "Service created");
        router.push("/app/services");
        router.refresh();
      } else toast.error(result.error ?? "Could not save service");
    });
  }

  const cents = price && Number.isFinite(Number(price)) ? Math.round(Number(price) * 100) : null;
  const tags = technologies.split(",").map((tag) => tag.trim()).filter(Boolean);

  return (
    <form onSubmit={submit} className="space-y-5">
      <header className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b bg-background/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:rounded-md lg:border lg:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button render={<Link href="/app/services" />} nativeButton={false} variant="ghost" size="icon" aria-label="Back to services"><ArrowLeft /></Button>
          <div><p className="text-sm font-medium">{service ? "Edit service" : "New service"}</p><p className="text-xs text-muted-foreground">Write on the left · verify the result on the right</p></div>
        </div>
        <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />}{service ? "Save changes" : published ? "Publish service" : "Save draft"}</Button>
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.78fr)]">
        <main className="min-w-0 space-y-5">
          <EditorSection title="What clients see first" description="Describe the outcome in plain language. These fields appear in the preview as you type.">
            <div className="space-y-1.5">
              <Label htmlFor="service-title">Service title</Label>
              <Input id="service-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Product strategy sprint" required maxLength={100} autoFocus={!service} />
              <p className="text-xs text-muted-foreground">Name the result or engagement—not your job title.</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3"><Label htmlFor="service-description">Description</Label><span className="text-[11px] tabular-nums text-muted-foreground">{description.length}/2000</span></div>
              <Textarea id="service-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explain what the client receives, the problem it solves, and what a successful outcome looks like." required minLength={10} maxLength={2000} rows={8} className="resize-y leading-6" />
            </div>
          </EditorSection>

          <EditorSection title="Set expectations" description="A price signal and timeframe help the right clients qualify themselves.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Price shown as</Label>
                <Select value={priceType} onValueChange={(value) => setPriceType(value as PriceType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="STARTING_AT">Starting at</SelectItem><SelectItem value="FIXED">Fixed price</SelectItem><SelectItem value="ON_REQUEST">Price on request</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label htmlFor="delivery">Typical delivery time</Label><div className="relative"><Input id="delivery" type="number" min="1" max="365" value={deliveryDays} onChange={(event) => setDeliveryDays(event.target.value)} placeholder="10" className="pr-12" /><span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs text-muted-foreground">days</span></div></div>
            </div>
            {priceType !== "ON_REQUEST" ? <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3"><div className="space-y-1.5"><Label htmlFor="price">Amount</Label><Input id="price" type="number" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="2500" /></div><div className="space-y-1.5"><Label htmlFor="currency">Currency</Label><Input id="currency" maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} /></div></div> : null}
          </EditorSection>

          <EditorSection title="Relevant expertise" description="Optional. Add only the methods or technologies that help clients understand the offer.">
            <div className="space-y-1.5"><Label htmlFor="service-tags">Skills or technologies</Label><Input id="service-tags" value={technologies} onChange={(event) => setTechnologies(event.target.value)} placeholder="Strategy, Research, Next.js" /><p className="text-xs text-muted-foreground">Separate tags with commas.</p></div>
          </EditorSection>
        </main>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-5 lg:self-start">
          <section className="overflow-hidden rounded-md border bg-card/45">
            <div className="flex items-center justify-between border-b px-4 py-3"><div className="flex items-center gap-2"><Eye className="size-4 text-muted-foreground" /><h2 className="text-sm font-medium">Profile preview</h2></div><span className="text-[11px] text-muted-foreground">Updates live</span></div>
            <div className="bg-background/45 p-4 sm:p-6">
              <div className="grid gap-4 rounded-md bg-card/40 px-5 py-6 sm:grid-cols-[2rem_1fr] sm:gap-5">
                <span className="pt-1 font-editorial text-sm italic text-muted-foreground/70">01</span>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-editorial text-xl leading-snug tracking-[-0.01em]">{title || "Your service title"}</h3>
                      {deliveryDays ? <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3" strokeWidth={1.5} />{formatDelivery(Number(deliveryDays))}</span> : null}
                    </div>
                    <div className="shrink-0 text-right"><span className="text-sm font-medium tabular-nums">{formatPrice(priceType, cents, currency || "EUR")}</span>{priceType !== "ON_REQUEST" ? <p className="mt-0.5 text-[11px] text-muted-foreground">{priceType === "FIXED" ? "fixed price" : "starting price"}</p> : null}</div>
                  </div>
                  <p className="mt-4 text-sm leading-[1.7] text-muted-foreground text-pretty">{description || "Your service description will appear here exactly as visitors see it on your profile."}</p>
                  {tags.length ? <p className="mt-4 text-xs text-muted-foreground/80">{tags.join("  ·  ")}</p> : null}
                  <span className="mt-5 inline-flex items-center gap-1.5 border-b border-brand/35 pb-0.5 text-xs font-medium text-brand">Discuss this service <ArrowRight className="size-3.5" /></span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-md border bg-card/45 p-4">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">Publish on profile</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">Turn this off to keep the service as a private draft.</p></div><Switch checked={published} onCheckedChange={setPublished} aria-label="Publish on profile" /></div>
          </section>
        </aside>
      </div>
    </form>
  );
}

function EditorSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-md border bg-card/45 p-5 sm:p-6"><h2 className="font-medium tracking-tight">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p><div className="mt-5 space-y-5">{children}</div></section>;
}

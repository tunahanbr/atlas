import Link from "next/link";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-6 sm:py-24"><Link href="/" className="font-editorial text-sm">◆ Atlas</Link><p className="mt-16 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Updated {updated}</p><h1 className="font-editorial mt-3 text-4xl tracking-tight">{title}</h1><div className="mt-10 space-y-5 text-sm leading-7 text-muted-foreground [&_h2]:font-editorial [&_h2]:pt-5 [&_h2]:text-xl [&_h2]:text-foreground">{children}</div></main>;
}

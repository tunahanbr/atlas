import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">This page doesn&apos;t exist</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The profile you&apos;re looking for may have moved or never existed.
      </p>
      <Button render={<Link href="/" />} nativeButton={false} variant="outline" className="rounded-xl">
        Back to Atlas
      </Button>
    </main>
  );
}

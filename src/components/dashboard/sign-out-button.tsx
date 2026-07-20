"use client";

import { LogOut } from "lucide-react";

import { signOutToHome } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutToHome}>
      <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
        <LogOut className="size-4" />
      </Button>
    </form>
  );
}

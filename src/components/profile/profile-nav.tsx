import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function ProfileNav({ name }: { name: string }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6">
        <span className="text-sm font-medium tracking-tight">{name}</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button render={<a href="#contact" />} nativeButton={false} size="sm" className="rounded-lg">
            Work with me
          </Button>
        </div>
      </div>
    </nav>
  );
}

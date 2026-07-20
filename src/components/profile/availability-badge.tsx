import { cn } from "@/lib/utils";
import { AVAILABILITY_LABELS } from "@/lib/constants";

const DOT: Record<string, string> = {
  AVAILABLE: "bg-success",
  LIMITED: "bg-amber-500",
  UNAVAILABLE: "bg-muted-foreground",
};

export function AvailabilityBadge({
  status,
  note,
  className,
}: {
  status: "AVAILABLE" | "LIMITED" | "UNAVAILABLE";
  note?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1 text-xs font-medium text-foreground",
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className={cn("relative inline-flex size-2 rounded-full", DOT[status])} />
      </span>
      {AVAILABILITY_LABELS[status]}
      {note ? <span className="text-muted-foreground">· {note}</span> : null}
    </span>
  );
}

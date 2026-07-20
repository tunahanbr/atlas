"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { reorderEntities } from "@/server/actions/entities";

export function useReorder<T extends { id: string }>(source: T[], kind: "services" | "projects" | "testimonials") {
  const [items, setItems] = useState(source);
  const sourceKey = source.map((item) => item.id).join(":");
  const [syncedKey, setSyncedKey] = useState(sourceKey);
  const [dragged, setDragged] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  if (sourceKey !== syncedKey) {
    setSyncedKey(sourceKey);
    setItems(source);
  }

  function move(id: string, targetId: string) {
    if (id === targetId) return;
    const next = [...items];
    const from = next.findIndex((item) => item.id === id);
    const to = next.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setItems(next);
    startTransition(async () => {
      const result = await reorderEntities(kind, next.map((entry) => entry.id));
      if (!result.ok) { setItems(source); toast.error(result.error ?? "Could not reorder"); }
      else router.refresh();
    });
  }

  function moveBy(id: string, delta: number) {
    const index = items.findIndex((item) => item.id === id);
    const target = items[index + delta];
    if (target) move(id, target.id);
  }

  return {
    items, pending, moveBy,
    dragProps: (id: string) => ({
      draggable: true,
      onDragStart: () => setDragged(id),
      onDragEnd: () => setDragged(null),
      onDragOver: (event: React.DragEvent) => event.preventDefault(),
      onDrop: () => { if (dragged) move(dragged, id); },
    }),
  };
}

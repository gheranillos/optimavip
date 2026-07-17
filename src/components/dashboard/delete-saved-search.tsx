"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { deleteSavedSearch } from "@/lib/actions/saved-search";
import { Button } from "@/components/ui/button";

export function DeleteSavedSearch({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      const res = await deleteSavedSearch(id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onDelete}
      disabled={isPending}
      aria-label="Eliminar"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

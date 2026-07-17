"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { BellPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { saveSearch } from "@/lib/actions/saved-search";
import { Button } from "@/components/ui/button";

export function SaveSearchButton() {
  const t = useTranslations("Search");
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function onSave() {
    const raw: Record<string, string> = {};
    for (const [k, v] of sp.entries()) raw[k] = v;

    startTransition(async () => {
      const res = await saveSearch(raw);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("searchSaved"));
    });
  }

  return (
    <Button variant="outline" onClick={onSave} disabled={isPending}>
      <BellPlus className="size-4" />
      {t("saveSearch")}
    </Button>
  );
}

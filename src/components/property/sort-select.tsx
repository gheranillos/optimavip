"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SortSelect() {
  const t = useTranslations("Search");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "recent";

  function onChange(value: string) {
    const query = new URLSearchParams(Array.from(sp.entries()));
    query.set("sort", value);
    query.delete("page");
    router.push({ pathname, query: Object.fromEntries(query) });
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recent">{t("sortRecent")}</SelectItem>
        <SelectItem value="price_asc">{t("sortPriceAsc")}</SelectItem>
        <SelectItem value="price_desc">{t("sortPriceDesc")}</SelectItem>
        <SelectItem value="views">{t("sortViews")}</SelectItem>
      </SelectContent>
    </Select>
  );
}

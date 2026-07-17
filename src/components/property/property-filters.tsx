"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";

import { useRouter, usePathname } from "@/i18n/navigation";
import { PropertyType, ListingMode } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MODE_KEY: Record<ListingMode, string> = {
  SALE: "forSale",
  RENT: "forRent",
  BUY: "forBuy",
};

const ANY = "__any__";

export function PropertyFilters({
  zones,
}: {
  zones: { id: string; name: string }[];
}) {
  const t = useTranslations("Search");
  const tp = useTranslations("Property");
  const tc = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [type, setType] = useState(sp.get("type") ?? ANY);
  const [mode, setMode] = useState(sp.get("mode") ?? ANY);
  const [zone, setZone] = useState(sp.get("zone") ?? ANY);
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") ?? "");
  const [minBedrooms, setMinBedrooms] = useState(sp.get("minBedrooms") ?? "");
  const [minBathrooms, setMinBathrooms] = useState(sp.get("minBathrooms") ?? "");
  const [minArea, setMinArea] = useState(sp.get("minArea") ?? "");

  function apply() {
    const query: Record<string, string> = {};
    const sort = sp.get("sort");
    if (sort) query.sort = sort;
    if (q) query.q = q;
    if (type !== ANY) query.type = type;
    if (mode !== ANY) query.mode = mode;
    if (zone !== ANY) query.zone = zone;
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;
    if (minBedrooms) query.minBedrooms = minBedrooms;
    if (minBathrooms) query.minBathrooms = minBathrooms;
    if (minArea) query.minArea = minArea;

    router.push({ pathname, query });
  }

  function clear() {
    setQ("");
    setType(ANY);
    setMode(ANY);
    setZone(ANY);
    setMinPrice("");
    setMaxPrice("");
    setMinBedrooms("");
    setMinBathrooms("");
    setMinArea("");
    router.push({ pathname });
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 font-semibold">
        <SlidersHorizontal className="size-4" />
        {tc("filters")}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="q">{tc("search")}</Label>
        <Input
          id="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="..."
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
      </div>

      <div className="grid gap-2">
        <Label>{t("type")}</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t("type")}</SelectItem>
            {Object.values(PropertyType).map((pt) => (
              <SelectItem key={pt} value={pt}>
                {tp(`types.${pt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>{t("mode")}</Label>
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t("mode")}</SelectItem>
            {Object.values(ListingMode).map((m) => (
              <SelectItem key={m} value={m}>
                {tp(MODE_KEY[m])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>{t("zone")}</Label>
        <Select value={zone} onValueChange={setZone}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t("zone")}</SelectItem>
            {zones.map((z) => (
              <SelectItem key={z.id} value={z.name}>
                {z.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-2">
          <Label htmlFor="minPrice">{t("minPrice")}</Label>
          <Input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="maxPrice">{t("maxPrice")}</Label>
          <Input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="grid gap-2">
          <Label htmlFor="minBedrooms">{tp("bedrooms")}</Label>
          <Input
            id="minBedrooms"
            type="number"
            value={minBedrooms}
            onChange={(e) => setMinBedrooms(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="minBathrooms">{tp("bathrooms")}</Label>
          <Input
            id="minBathrooms"
            type="number"
            value={minBathrooms}
            onChange={(e) => setMinBathrooms(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="minArea">{t("minArea")}</Label>
          <Input
            id="minArea"
            type="number"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={apply} className="flex-1">
          {tc("apply")}
        </Button>
        <Button onClick={clear} variant="outline" size="icon" aria-label="Clear">
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

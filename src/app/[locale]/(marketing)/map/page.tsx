import { setRequestLocale, getTranslations } from "next-intl/server";

import {
  parseFilters,
  getMapProperties,
} from "@/lib/data/public-property";
import { MapView, type MapMarker } from "@/components/map/map-view";

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const filters = parseFilters(await searchParams);
  const [t, properties] = await Promise.all([
    getTranslations("Nav"),
    getMapProperties(filters),
  ]);

  const markers: MapMarker[] = properties.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    lat: p.latitude as number,
    lng: p.longitude as number,
    price: Number(p.price),
    currency: p.currency,
    isOpportunityPrice: p.isOpportunityPrice,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">{t("map")}</h1>
      <MapView markers={markers} className="h-[70vh] w-full" />
    </div>
  );
}

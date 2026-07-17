import { setRequestLocale, getTranslations } from "next-intl/server";
import { SearchX } from "lucide-react";

import { Link } from "@/i18n/navigation";
import {
  parseFilters,
  searchProperties,
  getActiveZones,
} from "@/lib/data/public-property";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyFilters } from "@/components/property/property-filters";
import { SortSelect } from "@/components/property/sort-select";
import { Button } from "@/components/ui/button";

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const filters = parseFilters(sp);

  const [t, tSearch, zones, result] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Search"),
    getActiveZones(),
    searchProperties(filters),
  ]);

  // Build query strings for pagination while preserving current filters.
  const baseQuery: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k !== "page") baseQuery[k] = v;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-72 lg:shrink-0">
          <div className="lg:sticky lg:top-20">
            <PropertyFilters zones={zones} />
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("properties")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tSearch("results", { count: result.total })}
              </p>
            </div>
            <SortSelect />
          </div>

          {result.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-20 text-center text-muted-foreground">
              <SearchX className="size-10" />
              <p>{tSearch("noResults")}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((item) => (
                  <PropertyCard key={item.id} item={item} />
                ))}
              </div>

              {result.totalPages > 1 ? (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <Button
                    asChild
                    variant="outline"
                    disabled={result.page <= 1}
                  >
                    <Link
                      href={{
                        pathname: "/properties",
                        query: { ...baseQuery, page: String(result.page - 1) },
                      }}
                    >
                      ‹
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {result.page} / {result.totalPages}
                  </span>
                  <Button
                    asChild
                    variant="outline"
                    disabled={result.page >= result.totalPages}
                  >
                    <Link
                      href={{
                        pathname: "/properties",
                        query: { ...baseQuery, page: String(result.page + 1) },
                      }}
                    >
                      ›
                    </Link>
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

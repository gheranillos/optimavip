import { setRequestLocale, getTranslations } from "next-intl/server";
import { Bookmark, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteSavedSearch } from "@/components/dashboard/delete-saved-search";

export default async function SavedSearchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireUser();
  const [t, tp] = await Promise.all([
    getTranslations("SavedSearches"),
    getTranslations("Property"),
  ]);

  const searches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { zone: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      {searches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Bookmark className="size-8" />
            <p>{t("empty")}</p>
            <Button asChild>
              <Link href="/properties">{t("browse")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {searches.map((s) => {
            const chips: string[] = [];
            if (s.type) chips.push(tp(`types.${s.type}`));
            if (s.zone) chips.push(s.zone.name);
            if (s.minPrice) chips.push(`≥ ${s.minPrice}`);
            if (s.maxPrice) chips.push(`≤ ${s.maxPrice}`);
            if (s.minBedrooms) chips.push(`${s.minBedrooms}+ ${tp("bedrooms")}`);

            const query: Record<string, string> = {};
            if (s.type) query.type = s.type;
            if (s.modes[0]) query.mode = s.modes[0];
            if (s.zone) query.zone = s.zone.name;
            if (s.minPrice) query.minPrice = String(s.minPrice);
            if (s.maxPrice) query.maxPrice = String(s.maxPrice);
            if (s.minBedrooms) query.minBedrooms = String(s.minBedrooms);

            return (
              <Card key={s.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">
                      {s.name ?? t("unnamed")}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {chips.length > 0 ? (
                        chips.map((c) => (
                          <Badge key={c} variant="secondary">
                            {c}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("allProperties")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={{ pathname: "/properties", query }}>
                        {t("apply")}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <DeleteSavedSearch id={s.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

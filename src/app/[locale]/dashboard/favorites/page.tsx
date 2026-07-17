import { setRequestLocale, getTranslations } from "next-intl/server";
import { Heart } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth-guard";
import { listFavoriteProperties } from "@/lib/data/favorite";
import { PropertyCard } from "@/components/property/property-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireUser();
  const [t, properties] = await Promise.all([
    getTranslations("Dashboard"),
    listFavoriteProperties(user.id),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("favorites")}</h1>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Heart className="size-8" />
            <p>{t("empty")}</p>
            <Button asChild>
              <Link href="/properties">{t("properties")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((item) => (
            <PropertyCard
              key={item.id}
              item={item}
              showFavorite
              isAuthenticated
              isFavorite
            />
          ))}
        </div>
      )}
    </div>
  );
}

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Bed, Bath, Maximize, MapPin, ImageOff, Star } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/property/favorite-button";
import type { PublicPropertyCard } from "@/lib/data/public-property";
import type { ListingMode } from "@/generated/prisma/enums";

const MODE_KEY: Record<ListingMode, string> = {
  SALE: "forSale",
  RENT: "forRent",
  BUY: "forBuy",
};

export async function PropertyCard({
  item,
  showFavorite = false,
  isFavorite = false,
  isAuthenticated = false,
}: {
  item: PublicPropertyCard;
  showFavorite?: boolean;
  isFavorite?: boolean;
  isAuthenticated?: boolean;
}) {
  const t = await getTranslations("Property");
  const cover = item.images[0]?.url;

  return (
    <Link
      href={`/properties/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {showFavorite ? (
          <FavoriteButton
            propertyId={item.id}
            initialFavorite={isFavorite}
            isAuthenticated={isAuthenticated}
          />
        ) : null}
        {cover ? (
          <Image
            src={cover}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}

        {item.isOpportunityPrice ? (
          <Badge className="absolute left-3 top-3 gap-1 bg-amber-500 text-white hover:bg-amber-500">
            <Star className="size-3 fill-current" />
            {t("opportunityPrice")}
          </Badge>
        ) : null}

        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {item.modes.map((mode) => (
            <Badge key={mode} variant="secondary" className="backdrop-blur">
              {t(MODE_KEY[mode])}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-bold text-primary">
          {formatPrice(Number(item.price), item.currency)}
        </p>
        <h3 className="mt-1 line-clamp-1 font-semibold">{item.title}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {item.zone.name}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-sm text-muted-foreground">
          {item.bedrooms != null ? (
            <span className="flex items-center gap-1">
              <Bed className="size-4" />
              {item.bedrooms}
            </span>
          ) : null}
          {item.bathrooms != null ? (
            <span className="flex items-center gap-1">
              <Bath className="size-4" />
              {item.bathrooms}
            </span>
          ) : null}
          {item.constructionArea != null ? (
            <span className="flex items-center gap-1">
              <Maximize className="size-4" />
              {item.constructionArea} m²
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

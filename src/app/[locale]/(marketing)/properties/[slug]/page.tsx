import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  Bed,
  Bath,
  Maximize,
  Car,
  MapPin,
  Check,
  Star,
  CalendarClock,
  Play,
  Rotate3d,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";

import {
  getPublicPropertyBySlug,
  incrementPropertyViews,
} from "@/lib/data/public-property";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { ListingMode } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PropertyGallery } from "@/components/property/property-gallery";
import { ContactForm } from "@/components/property/contact-form";
import { MapView } from "@/components/map/map-view";

const MODE_KEY: Record<ListingMode, string> = {
  SALE: "forSale",
  RENT: "forRent",
  BUY: "forBuy",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);
  if (!property) return { title: "OPTIMA VIP" };
  return {
    title: property.title,
    description: property.description.slice(0, 160),
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const property = await getPublicPropertyBySlug(slug);
  if (!property) notFound();

  await incrementPropertyViews(property.id);

  const [t, tc] = await Promise.all([
    getTranslations("Property"),
    getTranslations("Contact"),
  ]);

  const realtor = property.realtor;
  const waNumber = realtor.whatsapp || realtor.phone;
  const waLink = waNumber
    ? buildWhatsAppLink(
        waNumber,
        `Hola, me interesa la propiedad "${property.title}".`
      )
    : null;

  const specs = [
    property.bedrooms != null
      ? { icon: Bed, label: t("bedrooms"), value: property.bedrooms }
      : null,
    property.bathrooms != null
      ? { icon: Bath, label: t("bathrooms"), value: property.bathrooms }
      : null,
    property.constructionArea != null
      ? {
          icon: Maximize,
          label: t("constructionArea"),
          value: `${property.constructionArea} m²`,
        }
      : null,
    property.landArea != null
      ? { icon: Maximize, label: t("landArea"), value: `${property.landArea} m²` }
      : null,
    property.parkingSpaces != null
      ? { icon: Car, label: t("parking"), value: property.parkingSpaces }
      : null,
    property.ageYears != null
      ? { icon: CalendarClock, label: "Antigüedad", value: `${property.ageYears}` }
      : null,
  ].filter(Boolean) as { icon: typeof Bed; label: string; value: string | number }[];

  const initials = (realtor.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <PropertyGallery images={property.images} title={property.title} />

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {property.isOpportunityPrice ? (
                <Badge className="gap-1 bg-amber-500 text-white hover:bg-amber-500">
                  <Star className="size-3 fill-current" />
                  {t("opportunityPrice")}
                </Badge>
              ) : null}
              {property.modes.map((m) => (
                <Badge key={m} variant="secondary">
                  {t(MODE_KEY[m])}
                </Badge>
              ))}
              <Badge variant="outline">{t(`types.${property.type}`)}</Badge>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {property.title}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" />
              {property.address ? `${property.address}, ` : ""}
              {property.zone.name}
            </p>
            <p className="mt-4 text-3xl font-bold text-primary">
              {formatPrice(Number(property.price), property.currency)}
            </p>
          </div>

          {/* Specs */}
          {specs.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border bg-card p-5 sm:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <s.icon className="size-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="font-semibold">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Description */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold">{t("description")}</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">
              {property.description}
            </p>
          </section>

          {/* Amenities */}
          {property.amenities.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold">{t("amenities")}</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.amenities.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-primary" />
                    {a.name}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Media links */}
          {property.videoUrl || property.virtualTourUrl ? (
            <section className="mt-8 flex flex-wrap gap-3">
              {property.videoUrl ? (
                <Button asChild variant="outline">
                  <a href={property.videoUrl} target="_blank" rel="noreferrer">
                    <Play className="size-4" />
                    {t("video")}
                  </a>
                </Button>
              ) : null}
              {property.virtualTourUrl ? (
                <Button asChild variant="outline">
                  <a
                    href={property.virtualTourUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Rotate3d className="size-4" />
                    {t("virtualTour")}
                  </a>
                </Button>
              ) : null}
            </section>
          ) : null}

          {/* Map */}
          {property.latitude != null && property.longitude != null ? (
            <section className="mt-8">
              <h2 className="mb-3 text-xl font-semibold">{t("location")}</h2>
              <MapView
                zoom={15}
                className="h-80 w-full"
                markers={[
                  {
                    id: property.id,
                    slug: property.slug,
                    title: property.title,
                    lat: property.latitude,
                    lng: property.longitude,
                    price: Number(property.price),
                    currency: property.currency,
                    isOpportunityPrice: property.isOpportunityPrice,
                  },
                ]}
              />
            </section>
          ) : null}
        </div>

        {/* Contact sidebar */}
        <aside className="lg:col-span-1">
          <div className="space-y-4 lg:sticky lg:top-20">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    {realtor.image ? (
                      <AvatarImage src={realtor.image} alt={realtor.name ?? ""} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{realtor.name ?? "OPTIMA VIP"}</p>
                    {realtor.agency ? (
                      <p className="text-xs text-muted-foreground">
                        {realtor.agency}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {waLink ? (
                  <Button
                    asChild
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    <a href={waLink} target="_blank" rel="noreferrer">
                      <Phone className="size-4" />
                      {t("whatsapp")}
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("contactRealtor")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm
                  propertyId={property.id}
                  realtorId={realtor.id}
                  defaultMessage={tc("defaultMessage", { title: property.title })}
                />
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  Search,
  ShieldCheck,
  Building2,
  Globe2,
  MapPin,
  ArrowRight,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchProperties } from "@/lib/data/public-property";
import { PropertyCard } from "@/components/property/property-card";
import { InterestFormSection } from "@/components/marketing/interest-form-section";

const ZONES = ["Lechería", "El Tigre", "Barcelona", "Puerto La Cruz"];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [tHome, tNav, recent] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Nav"),
    searchProperties({ sort: "recent", page: 1 }),
  ]);
  const featured = recent.items.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Globe2 className="size-3.5" />
              {tHome("heroSubtitle")}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {tHome("heroTitle")}
            </h1>

            <form
              action={`/${locale}/properties`}
              className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-xl border bg-background p-2 shadow-lg shadow-primary/5"
            >
              <div className="flex flex-1 items-center gap-2 pl-2">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder={tHome("searchPlaceholder")}
                  className="border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg">
                {tNav("properties")}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Asesores verificados",
              desc: "Cada asesor es aprobado manualmente por OPTIMA VIP.",
            },
            {
              icon: Building2,
              title: "Portafolio premium",
              desc: "Residencial, comercial, vacacional, industrial y más.",
            },
            {
              icon: Globe2,
              title: "Alcance global",
              desc: "Captamos clientes en todo el mundo, atención local.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently listed */}
      {featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              {tHome("recent")}
            </h2>
            <Button asChild variant="ghost">
              <Link href="/properties">
                {tHome("featured")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <PropertyCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Zones */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight">
          {tHome("browseByZone")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ZONES.map((zone) => (
            <Link
              key={zone}
              href={`/properties?zone=${encodeURIComponent(zone)}`}
              className="group relative flex h-40 items-end overflow-hidden rounded-xl border bg-gradient-to-br from-primary/80 to-primary p-5 text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_right,white,transparent_60%)]" />
              <span className="relative flex items-center gap-1.5 text-lg font-semibold">
                <MapPin className="size-5" />
                {zone}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Realtor CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary px-8 py-12 text-center text-primary-foreground sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {tHome("ctaRealtor")}
            </h2>
            <p className="mt-1 text-primary-foreground/80">
              {tHome("heroSubtitle")}
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">{tNav("register")}</Link>
          </Button>
        </div>
      </section>

      <InterestFormSection />
    </>
  );
}

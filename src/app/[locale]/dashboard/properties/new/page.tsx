import { setRequestLocale, getTranslations } from "next-intl/server";

import { requireApprovedRealtor } from "@/lib/auth-guard";
import { getFormCatalogs } from "@/lib/data/property";
import { PropertyForm } from "@/components/dashboard/property-form";

export default async function NewPropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireApprovedRealtor();
  const [t, { zones, amenities }] = await Promise.all([
    getTranslations("PropertyForm"),
    getFormCatalogs(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("newTitle")}</h1>
      <PropertyForm zones={zones} amenities={amenities} />
    </div>
  );
}

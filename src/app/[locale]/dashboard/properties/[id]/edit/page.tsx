import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { requireApprovedRealtor } from "@/lib/auth-guard";
import { getFormCatalogs, getPropertyForEdit } from "@/lib/data/property";
import { PropertyForm } from "@/components/dashboard/property-form";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const user = await requireApprovedRealtor();
  const [t, { zones, amenities }, defaults] = await Promise.all([
    getTranslations("PropertyForm"),
    getFormCatalogs(),
    getPropertyForEdit(id, user.id, user.role),
  ]);

  if (!defaults) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("editTitle")}</h1>
      <PropertyForm
        zones={zones}
        amenities={amenities}
        propertyId={id}
        defaultValues={defaults}
      />
    </div>
  );
}

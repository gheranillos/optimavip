import { setRequestLocale, getTranslations } from "next-intl/server";

import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/prisma/enums";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole([UserRole.ADMIN, UserRole.REALTOR]);
  const t = await getTranslations("Dashboard");
  return <ComingSoon title={t("closures")} />;
}

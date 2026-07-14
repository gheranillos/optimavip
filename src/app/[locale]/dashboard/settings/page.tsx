import { setRequestLocale, getTranslations } from "next-intl/server";

import { requireUser } from "@/lib/auth-guard";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser();
  const t = await getTranslations("Dashboard");
  return <ComingSoon title={t("settings")} />;
}

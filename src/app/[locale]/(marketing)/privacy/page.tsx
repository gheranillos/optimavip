import { setRequestLocale, getTranslations } from "next-intl/server";

import { PageShell } from "@/components/layout/page-shell";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Footer");
  return <PageShell title={t("privacy")} />;
}

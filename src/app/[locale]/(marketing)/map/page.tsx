import { setRequestLocale, getTranslations } from "next-intl/server";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tNav, tDash] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Dashboard"),
  ]);

  return (
    <PageShell title={tNav("map")}>
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          {tDash("comingSoon")}
        </CardContent>
      </Card>
    </PageShell>
  );
}

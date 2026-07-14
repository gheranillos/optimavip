import { setRequestLocale, getTranslations } from "next-intl/server";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";

export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tSearch, tDash] = await Promise.all([
    getTranslations("Search"),
    getTranslations("Dashboard"),
  ]);

  return (
    <PageShell title={tSearch("title")}>
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          {tDash("comingSoon")}
        </CardContent>
      </Card>
    </PageShell>
  );
}

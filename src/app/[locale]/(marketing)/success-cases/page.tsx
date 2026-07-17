import { setRequestLocale, getTranslations } from "next-intl/server";
import { Quote, Handshake } from "lucide-react";

import { prisma } from "@/lib/db";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SuccessCasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tNav, t] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("SuccessCases"),
  ]);

  const cases = await prisma.closureReport.findMany({
    where: {
      useAsTestimonial: true,
      isTestimonialApproved: true,
      testimonialText: { not: null },
    },
    orderBy: { closedAt: "desc" },
    take: 50,
    include: {
      property: { select: { title: true, zone: { select: { name: true } } } },
      realtor: { select: { name: true } },
    },
  });

  return (
    <PageShell title={tNav("successCases")} description={t("subtitle")}>
      {cases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Handshake className="size-8" />
            <p>{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {cases.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-4 py-6">
                <Quote className="size-6 text-primary/40" />
                <blockquote className="text-base leading-relaxed italic text-foreground">
                  “{c.testimonialText}”
                </blockquote>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {c.clientName ?? c.realtor.name ?? "Cliente OPTIMA VIP"}
                  </span>
                  <Badge variant="secondary">{c.property.zone.name}</Badge>
                  <span>· {c.property.title}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

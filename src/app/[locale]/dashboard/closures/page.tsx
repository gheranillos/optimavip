import { setRequestLocale, getTranslations } from "next-intl/server";
import { Handshake } from "lucide-react";

import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { UserRole, ClosureType } from "@/generated/prisma/enums";
import { formatPrice } from "@/lib/format";
import { isStaff } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialApprove } from "@/components/dashboard/testimonial-approve";

export default async function ClosuresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireRole([
    UserRole.DEVELOPER,
    UserRole.ADMIN,
    UserRole.REALTOR,
  ]);
  const isAdmin = isStaff(user.role);
  const t = await getTranslations("Closures");

  const closures = await prisma.closureReport.findMany({
    where: isAdmin ? {} : { realtorId: user.id },
    orderBy: { closedAt: "desc" },
    include: {
      property: { select: { title: true, currency: true } },
      realtor: { select: { name: true } },
    },
  });

  const typeLabel: Record<ClosureType, string> = {
    RESERVED: t("types.RESERVED"),
    SOLD: t("types.SOLD"),
    RENTED: t("types.RENTED"),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      {closures.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Handshake className="size-8" />
            <p>{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {closures.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-3 py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{c.property.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {isAdmin ? `${c.realtor.name ?? "—"} · ` : ""}
                      {c.finalPrice
                        ? formatPrice(Number(c.finalPrice), c.property.currency)
                        : ""}
                      {c.clientName ? ` · ${c.clientName}` : ""}
                    </p>
                  </div>
                  <Badge>{typeLabel[c.type]}</Badge>
                </div>

                {c.useAsTestimonial && c.testimonialText ? (
                  <blockquote className="border-l-2 border-primary pl-3 text-sm italic text-muted-foreground">
                    “{c.testimonialText}”
                  </blockquote>
                ) : null}

                {isAdmin && c.useAsTestimonial ? (
                  <div className="flex justify-end">
                    <TestimonialApprove
                      id={c.id}
                      approved={c.isTestimonialApproved}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

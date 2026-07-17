import { setRequestLocale, getTranslations } from "next-intl/server";
import { MessageSquare, Mail, Phone } from "lucide-react";

import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { UserRole, InquiryStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InquiryActions } from "@/components/dashboard/inquiry-actions";

const STATUS_BADGE: Record<InquiryStatus, "default" | "secondary" | "outline"> = {
  NEW: "default",
  READ: "secondary",
  ARCHIVED: "outline",
};

export default async function InquiriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireRole([UserRole.ADMIN, UserRole.REALTOR]);
  const t = await getTranslations("Inquiries");

  const inquiries = await prisma.contactInquiry.findMany({
    where: user.role === UserRole.ADMIN ? {} : { realtorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      message: true,
      status: true,
      createdAt: true,
      property: { select: { title: true, slug: true } },
    },
  });

  const statusLabel: Record<InquiryStatus, string> = {
    NEW: t("statusNew"),
    READ: t("statusRead"),
    ARCHIVED: t("statusArchived"),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <MessageSquare className="size-8" />
            <p>{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((i) => (
            <Card key={i.id}>
              <CardContent className="space-y-3 py-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{i.name}</p>
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="size-3.5" />
                        {i.phone}
                      </span>
                      {i.email ? (
                        <span className="flex items-center gap-1">
                          <Mail className="size-3.5" />
                          {i.email}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE[i.status]}>
                    {statusLabel[i.status]}
                  </Badge>
                </div>

                {i.property ? (
                  <p className="text-sm">
                    <span className="text-muted-foreground">{t("about")}: </span>
                    {i.property.title}
                  </p>
                ) : null}

                <p className="rounded-md bg-muted/50 p-3 text-sm">{i.message}</p>

                <InquiryActions id={i.id} phone={i.phone} status={i.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

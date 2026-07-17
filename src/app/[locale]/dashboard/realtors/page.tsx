import { setRequestLocale, getTranslations } from "next-intl/server";
import { UserCheck } from "lucide-react";

import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { UserRole, RealtorStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RealtorActions } from "@/components/dashboard/realtor-actions";

const STATUS_BADGE: Record<
  RealtorStatus,
  { variant: "secondary" | "default" | "destructive"; key: string }
> = {
  PENDING: { variant: "secondary", key: "statusPending" },
  APPROVED: { variant: "default", key: "statusApproved" },
  REJECTED: { variant: "destructive", key: "statusRejected" },
};

export default async function RealtorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations("Realtors");

  const realtors = await prisma.user.findMany({
    where: { role: UserRole.REALTOR },
    orderBy: [{ realtorStatus: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      realtorStatus: true,
      createdAt: true,
      _count: { select: { properties: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      {realtors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <UserCheck className="size-8" />
            <p>{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("colName")}</TableHead>
                  <TableHead>{t("colContact")}</TableHead>
                  <TableHead>{t("colProperties")}</TableHead>
                  <TableHead>{t("colStatus")}</TableHead>
                  <TableHead className="text-right">{t("colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {realtors.map((r) => {
                  const badge = r.realtorStatus
                    ? STATUS_BADGE[r.realtorStatus]
                    : STATUS_BADGE.PENDING;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.name ?? "—"}
                        <div className="text-xs text-muted-foreground">
                          {r.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.phone ?? "—"}
                      </TableCell>
                      <TableCell>{r._count.properties}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{t(badge.key)}</Badge>
                      </TableCell>
                      <TableCell>
                        <RealtorActions id={r.id} status={r.realtorStatus} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

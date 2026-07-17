import { setRequestLocale, getTranslations } from "next-intl/server";
import { Shield } from "lucide-react";

import { requireDeveloper } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { UserRole } from "@/generated/prisma/enums";
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
import { CreateAdminForm } from "@/components/dashboard/create-admin-form";
import { AdminUserActions } from "@/components/dashboard/admin-user-actions";

export default async function AdminsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireDeveloper();
  const t = await getTranslations("Admins");

  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <CreateAdminForm />

      {admins.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Shield className="size-10 opacity-40" />
            <p>{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("colName")}</TableHead>
                  <TableHead>{t("colContact")}</TableHead>
                  <TableHead>{t("colStatus")}</TableHead>
                  <TableHead>{t("colJoined")}</TableHead>
                  <TableHead className="text-right">{t("colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="font-medium">{admin.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {admin.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {admin.whatsapp || admin.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.isActive ? "default" : "secondary"}>
                        {admin.isActive ? t("statusActive") : t("statusInactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {admin.createdAt.toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminUserActions admin={admin} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

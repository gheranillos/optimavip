import { setRequestLocale, getTranslations } from "next-intl/server";
import { Users } from "lucide-react";

import { requireAdmin } from "@/lib/auth-guard";
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

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const [t, td] = await Promise.all([
    getTranslations("Users"),
    getTranslations("Dashboard"),
  ]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      realtorStatus: true,
      createdAt: true,
      _count: { select: { properties: true, favorites: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Users className="size-8" />
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
                  <TableHead>{t("colRole")}</TableHead>
                  <TableHead>{t("colContact")}</TableHead>
                  <TableHead>{t("colActivity")}</TableHead>
                  <TableHead>{t("colJoined")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name ?? "—"}
                      <div className="text-xs text-muted-foreground">
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{td(`roles.${u.role}`)}</Badge>
                      {u.role === UserRole.REALTOR && u.realtorStatus ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({u.realtorStatus})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u._count.properties} prop · {u._count.favorites} fav
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

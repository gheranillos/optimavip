import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Plus, ImageOff, Star } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { requireApprovedRealtor } from "@/lib/auth-guard";
import { listDashboardProperties } from "@/lib/data/property";
import { ApprovalStatus } from "@/generated/prisma/enums";
import { isStaff } from "@/lib/roles";
import { Button } from "@/components/ui/button";
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
import { PropertyActions } from "@/components/dashboard/property-actions";

const APPROVAL_BADGE: Record<
  ApprovalStatus,
  "secondary" | "default" | "destructive"
> = {
  PENDING_REVIEW: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireApprovedRealtor();
  const isAdmin = isStaff(user.role);

  const [t, tp, tStatus, properties] = await Promise.all([
    getTranslations("PropertyList"),
    getTranslations("Property"),
    getTranslations("Property.status"),
    listDashboardProperties(user.id, user.role),
  ]);

  const approvalLabel: Record<ApprovalStatus, string> = {
    PENDING_REVIEW: t("statusPending"),
    APPROVED: t("statusApproved"),
    REJECTED: t("statusRejected"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Button asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="size-4" />
            {t("new")}
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center text-muted-foreground">
            <p>{t("empty")}</p>
            <Button asChild>
              <Link href="/dashboard/properties/new">
                <Plus className="size-4" />
                {t("new")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16" />
                  <TableHead>{t("colTitle")}</TableHead>
                  <TableHead>{tp("location")}</TableHead>
                  <TableHead>{tp("price")}</TableHead>
                  <TableHead>{t("colApproval")}</TableHead>
                  <TableHead>{t("colStatus")}</TableHead>
                  {isAdmin ? <TableHead>{t("colRealtor")}</TableHead> : null}
                  <TableHead className="text-right">{t("colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((p) => {
                  const cover = p.images[0]?.url;
                  const price = new Intl.NumberFormat("es-VE", {
                    style: "currency",
                    currency: p.currency,
                    maximumFractionDigits: 0,
                  }).format(Number(p.price));

                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                          {cover ? (
                            <Image
                              src={cover}
                              alt={p.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                              <ImageOff className="size-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          {p.isOpportunityPrice ? (
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          ) : null}
                          <span className="line-clamp-1">{p.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.zone.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{price}</TableCell>
                      <TableCell>
                        <Badge variant={APPROVAL_BADGE[p.approvalStatus]}>
                          {approvalLabel[p.approvalStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {tStatus(p.status)}
                        </span>
                      </TableCell>
                      {isAdmin ? (
                        <TableCell className="text-muted-foreground">
                          {p.realtor.name ?? p.realtor.email}
                        </TableCell>
                      ) : null}
                      <TableCell className="text-right">
                        <PropertyActions
                          id={p.id}
                          isAdmin={isAdmin}
                          isPending={
                            p.approvalStatus === ApprovalStatus.PENDING_REVIEW
                          }
                        />
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

import { setRequestLocale, getTranslations } from "next-intl/server";
import { Building2, Clock, Eye, MessageSquare } from "lucide-react";

import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { UserRole, RealtorStatus, ApprovalStatus } from "@/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RealtorPendingCard } from "@/components/dashboard/realtor-pending-card";
import { isStaff } from "@/lib/roles";

async function getStats(userId: string, role: UserRole) {
  try {
    if (isStaff(role)) {
      const [total, pending, inquiries] = await Promise.all([
        prisma.property.count(),
        prisma.property.count({
          where: { approvalStatus: ApprovalStatus.PENDING_REVIEW },
        }),
        prisma.contactInquiry.count(),
      ]);
      return { total, pending, views: 0, inquiries };
    }
    if (role === UserRole.REALTOR) {
      const [total, pending, agg, inquiries] = await Promise.all([
        prisma.property.count({ where: { realtorId: userId } }),
        prisma.property.count({
          where: {
            realtorId: userId,
            approvalStatus: ApprovalStatus.PENDING_REVIEW,
          },
        }),
        prisma.property.aggregate({
          where: { realtorId: userId },
          _sum: { viewsCount: true },
        }),
        prisma.contactInquiry.count({ where: { realtorId: userId } }),
      ]);
      return {
        total,
        pending,
        views: agg._sum.viewsCount ?? 0,
        inquiries,
      };
    }
    // CLIENT
    const [favorites, searches] = await Promise.all([
      prisma.favorite.count({ where: { userId } }),
      prisma.savedSearch.count({ where: { userId } }),
    ]);
    return { total: favorites, pending: searches, views: 0, inquiries: 0 };
  } catch {
    return { total: 0, pending: 0, views: 0, inquiries: 0 };
  }
}

export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireUser();
  const t = await getTranslations("Dashboard");

  const isPendingRealtor =
    user.role === UserRole.REALTOR &&
    user.realtorStatus !== RealtorStatus.APPROVED;

  if (isPendingRealtor) {
    return <RealtorPendingCard />;
  }

  const stats = await getStats(user.id, user.role);

  const isClient = user.role === UserRole.CLIENT;
  const cards = isClient
    ? [
        { icon: Building2, label: t("favorites"), value: stats.total },
        { icon: Clock, label: t("savedSearches"), value: stats.pending },
      ]
    : [
        { icon: Building2, label: t("stats.totalProperties"), value: stats.total },
        { icon: Clock, label: t("stats.pending"), value: stats.pending },
        { icon: Eye, label: t("stats.views"), value: stats.views },
        { icon: MessageSquare, label: t("stats.inquiries"), value: stats.inquiries },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("welcome")}, {user.name ?? user.email}
        </h1>
        <p className="text-sm text-muted-foreground">{t(`roles.${user.role}`)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

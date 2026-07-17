import { setRequestLocale, getTranslations } from "next-intl/server";
import { Bell } from "lucide-react";

import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import {
  NotificationItem,
  MarkAllReadButton,
} from "@/components/dashboard/notification-item";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireUser();
  const t = await getTranslations("Notifications");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          {unread > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("unread", { count: unread })}
            </p>
          ) : null}
        </div>
        {unread > 0 ? <MarkAllReadButton /> : null}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Bell className="size-8" />
            <p>{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              id={n.id}
              title={n.title}
              body={n.body}
              linkUrl={n.linkUrl}
              isRead={n.isRead}
              createdAt={n.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

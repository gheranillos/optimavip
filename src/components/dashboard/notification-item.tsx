"use client";

import { useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useRouter, Link } from "@/i18n/navigation";
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/lib/actions/notification";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotificationItem({
  id,
  title,
  body,
  linkUrl,
  isRead,
  createdAt,
}: {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: Date;
}) {
  const t = useTranslations("Notifications");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markRead() {
    startTransition(async () => {
      await markNotificationRead(id);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteNotification(id);
      toast.success(t("deleted"));
      router.refresh();
    });
  }

  const content = (
    <div className="min-w-0 flex-1">
      <p className={cn("font-medium", !isRead && "text-primary")}>{title}</p>
      {body ? (
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{body}</p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground">
        {createdAt.toLocaleString()}
      </p>
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        !isRead && "bg-primary/5"
      )}
    >
      {linkUrl ? (
        <Link href={linkUrl} className="min-w-0 flex-1" onClick={markRead}>
          {content}
        </Link>
      ) : (
        content
      )}
      <div className="flex shrink-0 gap-1">
        {!isRead ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={isPending}
            onClick={markRead}
            title={t("markRead")}
          >
            <Check className="size-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={isPending}
          onClick={remove}
          title={t("delete")}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function MarkAllReadButton() {
  const t = useTranslations("Notifications");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markAllNotificationsRead();
          toast.success(t("allRead"));
          router.refresh();
        })
      }
    >
      {t("markAllRead")}
    </Button>
  );
}

import { prisma } from "@/lib/db";
import type { NotificationType } from "@/generated/prisma/enums";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  linkUrl?: string;
};

/**
 * Creates an in-app notification. Best-effort: failures are swallowed so they
 * never block the primary action.
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        linkUrl: input.linkUrl,
      },
    });
  } catch (error) {
    console.error("[notifications] failed to create notification", error);
  }
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  if (inputs.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: inputs.map((i) => ({
        userId: i.userId,
        type: i.type,
        title: i.title,
        body: i.body,
        linkUrl: i.linkUrl,
      })),
    });
  } catch (error) {
    console.error("[notifications] failed to create notifications", error);
  }
}

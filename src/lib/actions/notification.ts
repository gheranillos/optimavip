"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type ActionResult = { success: true } | { success: false; error: string };

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  const n = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!n || n.userId !== session.user.id) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function deleteNotification(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  const n = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!n || n.userId !== session.user.id) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.notification.delete({ where: { id } });
  revalidatePath("/dashboard/notifications");
  return { success: true };
}

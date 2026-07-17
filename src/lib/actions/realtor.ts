"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import {
  emailRealtorApproved,
  emailRealtorRejected,
} from "@/lib/email-templates";
import {
  RealtorStatus,
  NotificationType,
} from "@/generated/prisma/enums";
import { isStaff } from "@/lib/roles";

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdminActor() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) return null;
  return session.user;
}

export async function approveRealtor(id: string): Promise<ActionResult> {
  if (!(await requireAdminActor())) return { success: false, error: "No autorizado" };

  const user = await prisma.user.update({
    where: { id },
    data: { realtorStatus: RealtorStatus.APPROVED },
    select: { email: true, name: true },
  });

  await createNotification({
    userId: id,
    type: NotificationType.REALTOR_APPROVED,
    title: "Tu cuenta de asesor fue aprobada",
    body: "Ya puedes publicar propiedades en OPTIMA VIP.",
    linkUrl: "/dashboard/properties",
  });

  if (user.email) {
    await emailRealtorApproved({
      to: user.email,
      name: user.name,
    }).catch(() => undefined);
  }

  revalidatePath("/dashboard/realtors");
  return { success: true };
}

export async function rejectRealtor(id: string): Promise<ActionResult> {
  if (!(await requireAdminActor())) return { success: false, error: "No autorizado" };

  const user = await prisma.user.update({
    where: { id },
    data: { realtorStatus: RealtorStatus.REJECTED },
    select: { email: true, name: true },
  });

  await createNotification({
    userId: id,
    type: NotificationType.REALTOR_REJECTED,
    title: "Tu solicitud de asesor fue rechazada",
    body: "Contacta a OPTIMA VIP para más información.",
  });

  if (user.email) {
    await emailRealtorRejected({
      to: user.email,
      name: user.name,
    }).catch(() => undefined);
  }

  revalidatePath("/dashboard/realtors");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { closureSchema, type ClosureInput } from "@/lib/validations/closure";
import {
  UserRole,
  ClosureType,
  PropertyStatus,
  NotificationType,
} from "@/generated/prisma/enums";

type ActionResult = { success: true } | { success: false; error: string };

const CLOSURE_TO_STATUS: Record<ClosureType, PropertyStatus> = {
  RESERVED: PropertyStatus.RESERVED,
  SOLD: PropertyStatus.SOLD,
  RENTED: PropertyStatus.RENTED,
};

export async function reportClosure(input: ClosureInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  const parsed = closureSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const data = parsed.data;

  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    select: { realtorId: true, title: true },
  });
  if (!property) return { success: false, error: "Propiedad no encontrada" };

  const isAdmin = session.user.role === UserRole.ADMIN;
  if (!isAdmin && property.realtorId !== session.user.id) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.$transaction([
    prisma.closureReport.upsert({
      where: { propertyId: data.propertyId },
      update: {
        type: data.type,
        finalPrice: data.finalPrice ?? null,
        clientName: data.clientName ?? null,
        notes: data.notes ?? null,
        useAsTestimonial: data.useAsTestimonial,
        testimonialText: data.testimonialText ?? null,
      },
      create: {
        propertyId: data.propertyId,
        realtorId: property.realtorId,
        type: data.type,
        finalPrice: data.finalPrice ?? null,
        clientName: data.clientName ?? null,
        notes: data.notes ?? null,
        useAsTestimonial: data.useAsTestimonial,
        testimonialText: data.testimonialText ?? null,
      },
    }),
    prisma.property.update({
      where: { id: data.propertyId },
      data: { status: CLOSURE_TO_STATUS[data.type] },
    }),
  ]);

  // Notify admins about the closure.
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { id: true },
  });
  await Promise.all(
    admins.map((a) =>
      createNotification({
        userId: a.id,
        type: NotificationType.CLOSURE_REPORTED,
        title: "Cierre reportado",
        body: property.title,
        linkUrl: "/dashboard/closures",
      })
    )
  );

  revalidatePath("/dashboard/closures");
  revalidatePath("/dashboard/properties");
  return { success: true };
}

export async function setTestimonialApproved(
  id: string,
  approved: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.closureReport.update({
    where: { id },
    data: { isTestimonialApproved: approved },
  });

  revalidatePath("/dashboard/closures");
  revalidatePath("/success-cases");
  return { success: true };
}

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { emailInquiryReceived } from "@/lib/email-templates";
import { revalidatePath } from "next/cache";

import { inquirySchema, type InquiryInput } from "@/lib/validations/inquiry";
import {
  NotificationType,
  InquiryStatus,
} from "@/generated/prisma/enums";
import { isStaff } from "@/lib/roles";

type ActionResult = { success: true } | { success: false; error: string };

export async function setInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado" };

  const inquiry = await prisma.contactInquiry.findUnique({
    where: { id },
    select: { realtorId: true },
  });
  if (!inquiry) return { success: false, error: "No encontrada" };

  if (!isStaff(session.user.role) && inquiry.realtorId !== session.user.id) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.contactInquiry.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/inquiries");
  return { success: true };
}

export async function createInquiry(input: InquiryInput): Promise<ActionResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const data = parsed.data;

  const session = await auth();

  // Resolve the realtor from the property if not provided explicitly.
  let realtorId = data.realtorId ?? null;
  let propertyTitle: string | null = null;
  if (data.propertyId) {
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      select: { realtorId: true, title: true },
    });
    if (property) {
      realtorId = realtorId ?? property.realtorId;
      propertyTitle = property.title;
    }
  }

  await prisma.contactInquiry.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      message: data.message,
      propertyId: data.propertyId ?? null,
      realtorId,
      clientId: session?.user?.id ?? null,
    },
  });

  if (realtorId) {
    await createNotification({
      userId: realtorId,
      type: NotificationType.NEW_INQUIRY,
      title: "Nueva consulta",
      body: propertyTitle
        ? `${data.name} consultó por "${propertyTitle}"`
        : `${data.name} te envió una consulta`,
      linkUrl: "/dashboard/inquiries",
    });

    const realtor = await prisma.user.findUnique({
      where: { id: realtorId },
      select: { email: true, name: true },
    });
    if (realtor?.email) {
      await emailInquiryReceived({
        to: realtor.email,
        realtorName: realtor.name,
        clientName: data.name,
        phone: data.phone,
        email: data.email || null,
        message: data.message,
        propertyTitle,
      }).catch(() => undefined);
    }
  }

  return { success: true };
}

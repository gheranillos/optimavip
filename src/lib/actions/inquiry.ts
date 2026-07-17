"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import { inquirySchema, type InquiryInput } from "@/lib/validations/inquiry";
import { NotificationType } from "@/generated/prisma/enums";

type ActionResult = { success: true } | { success: false; error: string };

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
      await sendEmail({
        to: realtor.email,
        subject: "Nueva consulta — OPTIMA VIP",
        replyTo: data.email || undefined,
        html: `
          <p>Hola ${realtor.name ?? ""},</p>
          <p>Recibiste una nueva consulta${propertyTitle ? ` por <strong>${propertyTitle}</strong>` : ""}:</p>
          <ul>
            <li><strong>Nombre:</strong> ${data.name}</li>
            <li><strong>Teléfono:</strong> ${data.phone}</li>
            ${data.email ? `<li><strong>Email:</strong> ${data.email}</li>` : ""}
          </ul>
          <p>${data.message}</p>
        `,
      }).catch(() => undefined);
    }
  }

  return { success: true };
}

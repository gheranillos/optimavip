"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { UserRole, RealtorStatus, NotificationType } from "@/generated/prisma/enums";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { name, email, phone, password, accountType } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { success: false, error: "Ya existe una cuenta con este correo." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const isRealtor = accountType === "REALTOR";

  await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      phone: phone || null,
      whatsapp: phone || null,
      passwordHash,
      role: isRealtor ? UserRole.REALTOR : UserRole.CLIENT,
      realtorStatus: isRealtor ? RealtorStatus.PENDING : null,
    },
  });

  // Notify admins about a new realtor awaiting approval.
  if (isRealtor) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: UserRole.ADMIN },
        select: { id: true },
      });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: NotificationType.GENERAL,
            title: "Nuevo asesor pendiente de aprobación",
            body: `${name} (${normalizedEmail}) se registró como asesor.`,
            linkUrl: "/dashboard/realtors",
          })),
        });
      }
    } catch {
      // Notifications are best-effort; do not block registration.
    }
  }

  return { success: true };
}

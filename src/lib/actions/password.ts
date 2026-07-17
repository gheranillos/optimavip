"use server";

import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { emailPasswordReset } from "@/lib/email-templates";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/password";

type ActionResult = { success: true } | { success: false; error: string };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  "https://optimavip.vercel.app";

export async function changePassword(
  input: ChangePasswordInput
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true, isActive: true },
  });
  if (!user?.passwordHash || !user.isActive) {
    return { success: false, error: "No se puede cambiar la contraseña" };
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );
  if (!valid) {
    return { success: false, error: "La contraseña actual es incorrecta" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  return { success: true };
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
  locale = "es"
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Correo inválido",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, passwordHash: true, isActive: true },
  });

  // Always succeed to avoid email enumeration.
  if (!user?.passwordHash || !user.isActive) {
    return { success: true };
  }

  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { email, tokenHash, expiresAt },
  });

  const resetUrl = `${appUrl()}/${locale}/reset-password?token=${token}`;
  await emailPasswordReset({
    to: email,
    name: user.name,
    resetUrl,
  }).catch(() => undefined);

  return { success: true };
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const tokenHash = hashToken(parsed.data.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt < new Date()) {
    return {
      success: false,
      error: "El enlace no es válido o ya expiró. Solicita uno nuevo.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: record.email },
    select: { id: true, isActive: true },
  });
  if (!user?.isActive) {
    return { success: false, error: "Cuenta no disponible" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { email: record.email } }),
  ]);

  return { success: true };
}

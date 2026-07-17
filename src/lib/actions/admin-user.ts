"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { emailAdminCreated } from "@/lib/email-templates";
import {
  createAdminSchema,
  updateAdminSchema,
  resetAdminPasswordSchema,
  changeAdminRoleSchema,
  type CreateAdminInput,
  type UpdateAdminInput,
  type ResetAdminPasswordInput,
  type ChangeAdminRoleInput,
} from "@/lib/validations/admin-user";
import {
  UserRole,
  RealtorStatus,
} from "@/generated/prisma/enums";
import { isDeveloper } from "@/lib/roles";

type ActionResult = { success: true } | { success: false; error: string };

async function requireDeveloperActor() {
  const session = await auth();
  if (!session?.user?.id || !isDeveloper(session.user.role)) return null;
  return session.user;
}

export async function createAdmin(
  input: CreateAdminInput
): Promise<ActionResult> {
  if (!(await requireDeveloperActor())) {
    return { success: false, error: "No autorizado" };
  }

  const parsed = createAdminSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const data = parsed.data;
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Ya existe una cuenta con este correo." };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  await prisma.user.create({
    data: {
      name: data.name,
      email,
      phone: data.phone || null,
      whatsapp: data.phone || null,
      passwordHash,
      role: UserRole.ADMIN,
      realtorStatus: null,
      isActive: true,
    },
  });

  await emailAdminCreated({
    to: email,
    name: data.name,
    temporaryPassword: data.password,
  }).catch(() => undefined);

  revalidatePath("/dashboard/admins");
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function updateAdmin(
  input: UpdateAdminInput
): Promise<ActionResult> {
  const actor = await requireDeveloperActor();
  if (!actor) return { success: false, error: "No autorizado" };

  const parsed = updateAdminSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const data = parsed.data;

  const target = await prisma.user.findUnique({
    where: { id: data.id },
    select: { role: true },
  });
  if (!target || target.role !== UserRole.ADMIN) {
    return { success: false, error: "Administrador no encontrado" };
  }

  await prisma.user.update({
    where: { id: data.id },
    data: {
      name: data.name,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      isActive: data.isActive,
    },
  });

  revalidatePath("/dashboard/admins");
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function resetAdminPassword(
  input: ResetAdminPasswordInput
): Promise<ActionResult> {
  if (!(await requireDeveloperActor())) {
    return { success: false, error: "No autorizado" };
  }

  const parsed = resetAdminPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.id },
    select: { role: true },
  });
  if (!target || target.role !== UserRole.ADMIN) {
    return { success: false, error: "Administrador no encontrado" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { id: parsed.data.id },
    data: { passwordHash },
  });

  revalidatePath("/dashboard/admins");
  return { success: true };
}

export async function changeAdminRole(
  input: ChangeAdminRoleInput
): Promise<ActionResult> {
  const actor = await requireDeveloperActor();
  if (!actor) return { success: false, error: "No autorizado" };

  const parsed = changeAdminRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const data = parsed.data;

  if (data.id === actor.id) {
    return { success: false, error: "No puedes cambiar tu propio rol." };
  }

  const target = await prisma.user.findUnique({
    where: { id: data.id },
    select: { role: true },
  });
  if (!target) return { success: false, error: "Usuario no encontrado" };
  if (target.role === UserRole.DEVELOPER) {
    return { success: false, error: "No se puede modificar un developer." };
  }
  if (target.role !== UserRole.ADMIN && data.role !== "ADMIN") {
    return { success: false, error: "Solo se gestionan administradores aquí." };
  }

  const nextRole =
    data.role === "ADMIN"
      ? UserRole.ADMIN
      : data.role === "REALTOR"
        ? UserRole.REALTOR
        : UserRole.CLIENT;

  await prisma.user.update({
    where: { id: data.id },
    data: {
      role: nextRole,
      realtorStatus:
        nextRole === UserRole.REALTOR ? RealtorStatus.PENDING : null,
    },
  });

  revalidatePath("/dashboard/admins");
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/realtors");
  return { success: true };
}

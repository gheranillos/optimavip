"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const profileSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  agency: z.string().max(160).optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

type ActionResult = { success: true } | { success: false; error: string };

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const data = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      agency: data.agency || null,
      bio: data.bio || null,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

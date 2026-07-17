"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type ToggleResult =
  | { success: true; favorited: boolean }
  | { success: false; error: string };

export async function toggleFavorite(propertyId: string): Promise<ToggleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "auth" };
  }
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard/favorites");
    return { success: true, favorited: false };
  }

  await prisma.favorite.create({ data: { userId, propertyId } });
  revalidatePath("/dashboard/favorites");
  return { success: true, favorited: true };
}

"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parseFilters } from "@/lib/data/public-property";

type ActionResult = { success: true } | { success: false; error: string };

export async function saveSearch(
  raw: Record<string, string>
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  const f = parseFilters(raw);

  let zoneId: string | null = null;
  if (f.zone) {
    const zone = await prisma.zone.findFirst({
      where: { name: f.zone },
      select: { id: true },
    });
    zoneId = zone?.id ?? null;
  }

  await prisma.savedSearch.create({
    data: {
      userId: session.user.id,
      name: raw.name || null,
      type: f.type ?? null,
      modes: f.mode ? [f.mode] : [],
      zoneId,
      minPrice: f.minPrice ?? null,
      maxPrice: f.maxPrice ?? null,
      minBedrooms: f.minBedrooms ?? null,
      minBathrooms: f.minBathrooms ?? null,
      minArea: f.minArea ?? null,
    },
  });

  revalidatePath("/dashboard/saved-searches");
  return { success: true };
}

export async function deleteSavedSearch(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  const search = await prisma.savedSearch.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!search || search.userId !== session.user.id) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.savedSearch.delete({ where: { id } });
  revalidatePath("/dashboard/saved-searches");
  return { success: true };
}

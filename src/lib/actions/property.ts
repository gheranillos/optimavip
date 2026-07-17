"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { slugify, randomSuffix } from "@/lib/slug";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import {
  propertyFormSchema,
  rejectPropertySchema,
  type PropertyFormInput,
} from "@/lib/validations/property";
import {
  UserRole,
  RealtorStatus,
  ApprovalStatus,
  NotificationType,
} from "@/generated/prisma/enums";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function getActor() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

function canOperate(role: UserRole, realtorStatus: RealtorStatus | null) {
  if (role === UserRole.ADMIN) return true;
  if (role === UserRole.REALTOR && realtorStatus === RealtorStatus.APPROVED)
    return true;
  return false;
}

/** Builds the nested Prisma data payload shared by create & update. */
function buildData(values: ReturnType<typeof propertyFormSchema.parse>) {
  return {
    title: values.title,
    description: values.description,
    type: values.type,
    modes: values.modes,
    price: values.price,
    currency: values.currency,
    landArea: values.landArea ?? null,
    constructionArea: values.constructionArea ?? null,
    bedrooms: values.bedrooms ?? null,
    bathrooms: values.bathrooms ?? null,
    parkingSpaces: values.parkingSpaces ?? null,
    hasLivingDiningRoom: values.hasLivingDiningRoom,
    hasFamilyRoom: values.hasFamilyRoom,
    hasTerraceBalcony: values.hasTerraceBalcony,
    finishes: values.finishes ?? null,
    floorLevel: values.floorLevel ?? null,
    ageYears: values.ageYears ?? null,
    zoneId: values.zoneId,
    address: values.address ?? null,
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    videoUrl: values.videoUrl ?? null,
    virtualTourUrl: values.virtualTourUrl ?? null,
  };
}

export async function createProperty(
  input: PropertyFormInput
): Promise<ActionResult<{ id: string }>> {
  const actor = await getActor();
  if (!actor) return { success: false, error: "No autenticado" };
  if (!canOperate(actor.role, actor.realtorStatus)) {
    return { success: false, error: "No autorizado" };
  }

  const parsed = propertyFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const values = parsed.data;

  const isAdmin = actor.role === UserRole.ADMIN;
  const slug = `${slugify(values.title)}-${randomSuffix()}`;

  const property = await prisma.property.create({
    data: {
      ...buildData(values),
      slug,
      realtorId: actor.id,
      approvalStatus: isAdmin
        ? ApprovalStatus.APPROVED
        : ApprovalStatus.PENDING_REVIEW,
      publishedAt: isAdmin ? new Date() : null,
      amenities: { connect: values.amenityIds.map((id) => ({ id })) },
      images: {
        create: values.images.map((img, index) => ({
          url: img.url,
          blobKey: img.blobKey,
          alt: img.alt,
          order: index,
          isCover: index === 0,
        })),
      },
    },
    select: { id: true },
  });

  // Notify admins of a new submission awaiting review.
  if (!isAdmin) {
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true },
    });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: NotificationType.GENERAL,
          title: "Nueva propiedad para revisar",
          body: values.title,
          linkUrl: `/dashboard/properties/${property.id}/edit`,
        })
      )
    );
  }

  revalidatePath("/dashboard/properties");
  return { success: true, data: { id: property.id } };
}

export async function updateProperty(
  id: string,
  input: PropertyFormInput
): Promise<ActionResult> {
  const actor = await getActor();
  if (!actor) return { success: false, error: "No autenticado" };

  const existing = await prisma.property.findUnique({
    where: { id },
    select: { realtorId: true },
  });
  if (!existing) return { success: false, error: "Propiedad no encontrada" };

  const isAdmin = actor.role === UserRole.ADMIN;
  const isOwner = existing.realtorId === actor.id;
  if (!isAdmin && !(isOwner && canOperate(actor.role, actor.realtorStatus))) {
    return { success: false, error: "No autorizado" };
  }

  const parsed = propertyFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const values = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.propertyImage.deleteMany({ where: { propertyId: id } });
    await tx.property.update({
      where: { id },
      data: {
        ...buildData(values),
        // Realtor edits go back to review; admin edits keep current status.
        ...(isAdmin
          ? {}
          : { approvalStatus: ApprovalStatus.PENDING_REVIEW, publishedAt: null }),
        amenities: { set: values.amenityIds.map((aid) => ({ id: aid })) },
        images: {
          create: values.images.map((img, index) => ({
            url: img.url,
            blobKey: img.blobKey,
            alt: img.alt,
            order: index,
            isCover: index === 0,
          })),
        },
      },
    });
  });

  revalidatePath("/dashboard/properties");
  return { success: true };
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const actor = await getActor();
  if (!actor) return { success: false, error: "No autenticado" };

  const existing = await prisma.property.findUnique({
    where: { id },
    select: { realtorId: true },
  });
  if (!existing) return { success: false, error: "Propiedad no encontrada" };

  const isAdmin = actor.role === UserRole.ADMIN;
  if (!isAdmin && existing.realtorId !== actor.id) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.property.delete({ where: { id } });
  revalidatePath("/dashboard/properties");
  return { success: true };
}

export async function approveProperty(id: string): Promise<ActionResult> {
  const actor = await getActor();
  if (!actor || actor.role !== UserRole.ADMIN) {
    return { success: false, error: "No autorizado" };
  }

  const property = await prisma.property.update({
    where: { id },
    data: {
      approvalStatus: ApprovalStatus.APPROVED,
      rejectionReason: null,
      publishedAt: new Date(),
    },
    select: { id: true, title: true, realtorId: true, slug: true },
  });

  await createNotification({
    userId: property.realtorId,
    type: NotificationType.PROPERTY_APPROVED,
    title: "Propiedad aprobada",
    body: property.title,
    linkUrl: `/dashboard/properties`,
  });

  const realtor = await prisma.user.findUnique({
    where: { id: property.realtorId },
    select: { email: true, name: true },
  });
  if (realtor?.email) {
    await sendEmail({
      to: realtor.email,
      subject: "Tu propiedad fue aprobada — OPTIMA VIP",
      html: `<p>Hola ${realtor.name ?? ""},</p><p>Tu propiedad <strong>${property.title}</strong> fue aprobada y ya es visible al público.</p>`,
    }).catch(() => undefined);
  }

  revalidatePath("/dashboard/properties");
  return { success: true };
}

export async function rejectProperty(
  id: string,
  reason: string
): Promise<ActionResult> {
  const actor = await getActor();
  if (!actor || actor.role !== UserRole.ADMIN) {
    return { success: false, error: "No autorizado" };
  }

  const parsed = rejectPropertySchema.safeParse({ id, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Motivo inválido" };
  }

  const property = await prisma.property.update({
    where: { id },
    data: {
      approvalStatus: ApprovalStatus.REJECTED,
      rejectionReason: reason,
      publishedAt: null,
    },
    select: { title: true, realtorId: true },
  });

  await createNotification({
    userId: property.realtorId,
    type: NotificationType.PROPERTY_REJECTED,
    title: "Propiedad rechazada",
    body: `${property.title} — ${reason}`,
    linkUrl: `/dashboard/properties`,
  });

  revalidatePath("/dashboard/properties");
  return { success: true };
}

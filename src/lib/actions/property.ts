"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { slugify, randomSuffix } from "@/lib/slug";
import { createNotification } from "@/lib/notifications";
import {
  emailPropertyApproved,
  emailPropertyRejected,
} from "@/lib/email-templates";
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
import { isStaff, STAFF_ROLES } from "@/lib/roles";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function getActor() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

function canOperate(role: UserRole, realtorStatus: RealtorStatus | null) {
  if (isStaff(role)) return true;
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

  const staff = isStaff(actor.role);
  const slug = `${slugify(values.title)}-${randomSuffix()}`;

  const property = await prisma.property.create({
    data: {
      ...buildData(values),
      slug,
      realtorId: actor.id,
      approvalStatus: staff
        ? ApprovalStatus.APPROVED
        : ApprovalStatus.PENDING_REVIEW,
      publishedAt: staff ? new Date() : null,
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

  // Notify staff of a new submission awaiting review.
  if (!staff) {
    const admins = await prisma.user.findMany({
      where: { role: { in: STAFF_ROLES }, isActive: true },
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

  const staff = isStaff(actor.role);
  const isOwner = existing.realtorId === actor.id;
  if (!staff && !(isOwner && canOperate(actor.role, actor.realtorStatus))) {
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
        // Realtor edits go back to review; staff edits keep current status.
        ...(staff
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

  if (!isStaff(actor.role) && existing.realtorId !== actor.id) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.property.delete({ where: { id } });
  revalidatePath("/dashboard/properties");
  return { success: true };
}

export async function approveProperty(id: string): Promise<ActionResult> {
  const actor = await getActor();
  if (!actor || !isStaff(actor.role)) {
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
    await emailPropertyApproved({
      to: realtor.email,
      name: realtor.name,
      propertyTitle: property.title,
      propertySlug: property.slug,
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
  if (!actor || !isStaff(actor.role)) {
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

  const realtor = await prisma.user.findUnique({
    where: { id: property.realtorId },
    select: { email: true, name: true },
  });
  if (realtor?.email) {
    await emailPropertyRejected({
      to: realtor.email,
      name: realtor.name,
      propertyTitle: property.title,
      reason: parsed.data.reason,
    }).catch(() => undefined);
  }

  revalidatePath("/dashboard/properties");
  return { success: true };
}

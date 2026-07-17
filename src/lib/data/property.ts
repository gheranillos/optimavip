import { prisma } from "@/lib/db";
import { UserRole } from "@/generated/prisma/enums";
import type { PropertyFormFields } from "@/components/dashboard/property-form";
import { isStaff } from "@/lib/roles";

export async function getFormCatalogs() {
  const [zones, amenities] = await Promise.all([
    prisma.zone.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.amenity.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  return { zones, amenities };
}

export async function listDashboardProperties(
  userId: string,
  role: UserRole
) {
  return prisma.property.findMany({
    where: isStaff(role) ? {} : { realtorId: userId },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      currency: true,
      status: true,
      approvalStatus: true,
      isOpportunityPrice: true,
      viewsCount: true,
      createdAt: true,
      zone: { select: { name: true } },
      realtor: { select: { name: true, email: true } },
      images: {
        where: { isCover: true },
        take: 1,
        select: { url: true },
      },
      _count: { select: { inquiries: true, favorites: true } },
    },
  });
}

export type DashboardProperty = Awaited<
  ReturnType<typeof listDashboardProperties>
>[number];

/**
 * Loads a property and maps it to the form's default values. Returns null if
 * not found or the actor is not allowed to edit it.
 */
export async function getPropertyForEdit(
  id: string,
  userId: string,
  role: UserRole
): Promise<Partial<PropertyFormFields> | null> {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      amenities: { select: { id: true } },
      images: { orderBy: { order: "asc" }, select: { url: true, blobKey: true, alt: true } },
    },
  });

  if (!property) return null;
  if (!isStaff(role) && property.realtorId !== userId) return null;

  const toStr = (v: number | null) => (v === null ? "" : String(v));

  return {
    title: property.title,
    description: property.description,
    type: property.type,
    modes: property.modes,
    price: property.price.toString(),
    currency: property.currency,
    landArea: toStr(property.landArea),
    constructionArea: toStr(property.constructionArea),
    bedrooms: toStr(property.bedrooms),
    bathrooms: toStr(property.bathrooms),
    parkingSpaces: toStr(property.parkingSpaces),
    hasLivingDiningRoom: property.hasLivingDiningRoom,
    hasFamilyRoom: property.hasFamilyRoom,
    hasTerraceBalcony: property.hasTerraceBalcony,
    finishes: property.finishes ?? "",
    floorLevel: property.floorLevel ?? "",
    ageYears: toStr(property.ageYears),
    zoneId: property.zoneId,
    address: property.address ?? "",
    latitude: toStr(property.latitude),
    longitude: toStr(property.longitude),
    amenityIds: property.amenities.map((a) => a.id),
    videoUrl: property.videoUrl ?? "",
    virtualTourUrl: property.virtualTourUrl ?? "",
    images: property.images.map((img) => ({
      url: img.url,
      blobKey: img.blobKey ?? undefined,
      alt: img.alt ?? undefined,
    })),
  };
}

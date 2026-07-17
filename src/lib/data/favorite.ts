import { prisma } from "@/lib/db";
import { ApprovalStatus } from "@/generated/prisma/enums";

export async function isFavorited(
  userId: string,
  propertyId: string
): Promise<boolean> {
  const fav = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
    select: { id: true },
  });
  return !!fav;
}

export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  const favs = await prisma.favorite.findMany({
    where: { userId },
    select: { propertyId: true },
  });
  return new Set(favs.map((f) => f.propertyId));
}

export async function listFavoriteProperties(userId: string) {
  const favs = await prisma.favorite.findMany({
    where: { userId, property: { approvalStatus: ApprovalStatus.APPROVED } },
    orderBy: { createdAt: "desc" },
    select: {
      property: {
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          currency: true,
          type: true,
          modes: true,
          bedrooms: true,
          bathrooms: true,
          constructionArea: true,
          landArea: true,
          isOpportunityPrice: true,
          createdAt: true,
          zone: { select: { name: true } },
          images: { where: { isCover: true }, take: 1, select: { url: true } },
        },
      },
    },
  });
  return favs.map((f) => f.property);
}

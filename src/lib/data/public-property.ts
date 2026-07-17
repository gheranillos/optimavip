import { cache } from "react";

import { prisma } from "@/lib/db";
import {
  ApprovalStatus,
  PropertyStatus,
  PropertyType,
  ListingMode,
} from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export type SortOption = "recent" | "price_asc" | "price_desc" | "views";

export type PropertyFilters = {
  q?: string;
  type?: PropertyType;
  mode?: ListingMode;
  zone?: string; // zone name
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  sort?: SortOption;
  page?: number;
};

const PAGE_SIZE = 12;

function isEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: string | undefined
): value is T[keyof T] {
  return !!value && Object.values(enumObj).includes(value);
}

/** Parses raw searchParams (strings) into a typed, validated filter object. */
export function parseFilters(
  sp: Record<string, string | string[] | undefined>
): PropertyFilters {
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (k: string) => {
    const v = get(k);
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const type = get("type");
  const mode = get("mode");
  const sort = get("sort");

  return {
    q: get("q") || undefined,
    type: isEnumValue(PropertyType, type) ? type : undefined,
    mode: isEnumValue(ListingMode, mode) ? mode : undefined,
    zone: get("zone") || undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    minBedrooms: num("minBedrooms"),
    minBathrooms: num("minBathrooms"),
    minArea: num("minArea"),
    sort: (["recent", "price_asc", "price_desc", "views"] as const).includes(
      sort as SortOption
    )
      ? (sort as SortOption)
      : "recent",
    page: Math.max(1, num("page") ?? 1),
  };
}

function buildWhere(filters: PropertyFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    approvalStatus: ApprovalStatus.APPROVED,
    status: PropertyStatus.AVAILABLE,
  };

  if (filters.type) where.type = filters.type;
  if (filters.mode) where.modes = { has: filters.mode };
  if (filters.zone) where.zone = { name: filters.zone };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  if (filters.minBedrooms !== undefined)
    where.bedrooms = { gte: filters.minBedrooms };
  if (filters.minBathrooms !== undefined)
    where.bathrooms = { gte: filters.minBathrooms };
  if (filters.minArea !== undefined)
    where.constructionArea = { gte: filters.minArea };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildOrderBy(
  sort: SortOption
): Prisma.PropertyOrderByWithRelationInput[] {
  // Opportunity-price properties always float to the top.
  const base: Prisma.PropertyOrderByWithRelationInput = {
    isOpportunityPrice: "desc",
  };
  switch (sort) {
    case "price_asc":
      return [base, { price: "asc" }];
    case "price_desc":
      return [base, { price: "desc" }];
    case "views":
      return [base, { viewsCount: "desc" }];
    case "recent":
    default:
      return [base, { publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

const listSelect = {
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
  images: {
    where: { isCover: true },
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.PropertySelect;

export type PublicPropertyCard = Prisma.PropertyGetPayload<{
  select: typeof listSelect;
}>;

export async function searchProperties(filters: PropertyFilters) {
  const where = buildWhere(filters);
  const page = filters.page ?? 1;

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: buildOrderBy(filters.sort ?? "recent"),
      select: listSelect,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Properties with coordinates, for the public map. */
export async function getMapProperties(filters: PropertyFilters) {
  return prisma.property.findMany({
    where: {
      ...buildWhere(filters),
      latitude: { not: null },
      longitude: { not: null },
    },
    orderBy: buildOrderBy(filters.sort ?? "recent"),
    take: 300,
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      currency: true,
      latitude: true,
      longitude: true,
      isOpportunityPrice: true,
      images: { where: { isCover: true }, take: 1, select: { url: true } },
    },
  });
}

// Cached per-request so generateMetadata + the page share a single query.
export const getPublicPropertyBySlug = cache(async (slug: string) => {
  return prisma.property.findFirst({
    where: {
      slug,
      approvalStatus: ApprovalStatus.APPROVED,
      status: PropertyStatus.AVAILABLE,
    },
    include: {
      zone: { select: { name: true, region: true } },
      amenities: { select: { id: true, name: true, icon: true } },
      images: { orderBy: { order: "asc" }, select: { id: true, url: true, alt: true } },
      realtor: {
        select: {
          id: true,
          name: true,
          image: true,
          phone: true,
          whatsapp: true,
          agency: true,
          bio: true,
        },
      },
    },
  });
});

/** Best-effort view counter (call once from the page, not from metadata). */
export async function incrementPropertyViews(id: string) {
  await prisma.property
    .update({ where: { id }, data: { viewsCount: { increment: 1 } } })
    .catch(() => undefined);
}

export async function getActiveZones() {
  return prisma.zone.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

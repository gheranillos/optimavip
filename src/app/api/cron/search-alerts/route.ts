import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { emailPropertyMatch } from "@/lib/email-templates";
import { createNotification } from "@/lib/notifications";
import type { Prisma } from "@/generated/prisma/client";
import {
  ApprovalStatus,
  PropertyStatus,
  NotificationType,
} from "@/generated/prisma/enums";

export const maxDuration = 60;

/**
 * Vercel Cron: match saved searches against new / opportunity properties
 * and notify clients (email + in-app).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const searches = await prisma.savedSearch.findMany({
    where: {
      OR: [{ notifyNewMatches: true }, { notifyOpportunity: true }],
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      zone: { select: { id: true, name: true } },
    },
  });

  let processed = 0;
  let emailsSent = 0;

  for (const search of searches) {
    const since = search.lastNotifiedAt ?? search.createdAt;

    const where: Prisma.PropertyWhereInput = {
      approvalStatus: ApprovalStatus.APPROVED,
      status: PropertyStatus.AVAILABLE,
      OR: [
        { publishedAt: { gt: since } },
        { createdAt: { gt: since } },
        ...(search.notifyOpportunity
          ? [{ isOpportunityPrice: true as const, updatedAt: { gt: since } }]
          : []),
      ],
    };

    if (search.type) where.type = search.type;
    if (search.modes.length > 0) where.modes = { hasSome: search.modes };
    if (search.zoneId) where.zoneId = search.zoneId;
    if (search.minPrice != null || search.maxPrice != null) {
      where.price = {};
      if (search.minPrice != null) where.price.gte = search.minPrice;
      if (search.maxPrice != null) where.price.lte = search.maxPrice;
    }
    if (search.minBedrooms != null) where.bedrooms = { gte: search.minBedrooms };
    if (search.minBathrooms != null)
      where.bathrooms = { gte: search.minBathrooms };
    if (search.minArea != null)
      where.constructionArea = { gte: search.minArea };

    const matches = await prisma.property.findMany({
      where,
      take: 10,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        currency: true,
        isOpportunityPrice: true,
      },
    });

    if (matches.length === 0) continue;

    for (const match of matches) {
      const isOpp = match.isOpportunityPrice;
      if (isOpp && !search.notifyOpportunity) continue;
      if (!isOpp && !search.notifyNewMatches) continue;

      await createNotification({
        userId: search.userId,
        type: isOpp
          ? NotificationType.OPPORTUNITY_PRICE
          : NotificationType.NEW_MATCHING_PROPERTY,
        title: isOpp ? "Precio de oportunidad" : "Nueva propiedad",
        body: match.title,
        linkUrl: `/properties/${match.slug}`,
      });

      if (search.user.email) {
        await emailPropertyMatch({
          to: search.user.email,
          clientName: search.user.name,
          propertyTitle: match.title,
          propertySlug: match.slug,
          priceLabel: formatPrice(Number(match.price), match.currency),
          isOpportunity: isOpp,
        }).catch(() => undefined);
        emailsSent += 1;
      }
      processed += 1;
    }

    await prisma.savedSearch.update({
      where: { id: search.id },
      data: { lastNotifiedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true, processed, emailsSent });
}

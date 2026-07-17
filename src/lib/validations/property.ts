import { z } from "zod";

import {
  PropertyType,
  ListingMode,
  FloorLevel,
} from "@/generated/prisma/enums";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null ? undefined : v;

const optionalNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative().optional()
);

const optionalInt = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().nonnegative().optional()
);

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional()
);

export const propertyImageSchema = z.object({
  url: z.string().url(),
  blobKey: z.string().optional(),
  alt: z.string().optional(),
});

export const propertyFormSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(160),
  description: z.string().min(10, "Describe la propiedad (mín. 10 caracteres)"),

  type: z.enum(PropertyType),
  modes: z.array(z.enum(ListingMode)).min(1, "Selecciona al menos una modalidad"),

  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  currency: z.string().min(1).default("USD"),

  landArea: optionalNumber,
  constructionArea: optionalNumber,
  bedrooms: optionalInt,
  bathrooms: optionalInt,
  parkingSpaces: optionalInt,

  hasLivingDiningRoom: z.boolean().default(false),
  hasFamilyRoom: z.boolean().default(false),
  hasTerraceBalcony: z.boolean().default(false),

  finishes: z.preprocess(emptyToUndefined, z.string().optional()),
  floorLevel: z.preprocess(
    emptyToUndefined,
    z.enum(FloorLevel).optional()
  ),
  ageYears: optionalInt,

  zoneId: z.string().min(1, "Selecciona una zona"),
  address: z.preprocess(emptyToUndefined, z.string().optional()),
  latitude: z.preprocess(emptyToUndefined, z.coerce.number().min(-90).max(90).optional()),
  longitude: z.preprocess(emptyToUndefined, z.coerce.number().min(-180).max(180).optional()),

  amenityIds: z.array(z.string()).default([]),

  videoUrl: optionalUrl,
  virtualTourUrl: optionalUrl,

  images: z.array(propertyImageSchema).max(20, "Máximo 20 imágenes").default([]),
});

export type PropertyFormInput = z.input<typeof propertyFormSchema>;
export type PropertyFormValues = z.output<typeof propertyFormSchema>;

export const rejectPropertySchema = z.object({
  id: z.string().min(1),
  reason: z.string().min(3, "Indica un motivo").max(500),
});

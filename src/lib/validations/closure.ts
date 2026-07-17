import { z } from "zod";

import { ClosureType } from "@/generated/prisma/enums";

export const closureSchema = z.object({
  propertyId: z.string().min(1),
  type: z.enum(ClosureType),
  finalPrice: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().nonnegative().optional()
  ),
  clientName: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().max(160).optional()
  ),
  notes: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().max(1000).optional()
  ),
  useAsTestimonial: z.boolean().default(false),
  testimonialText: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().max(1000).optional()
  ),
});

export type ClosureInput = z.infer<typeof closureSchema>;

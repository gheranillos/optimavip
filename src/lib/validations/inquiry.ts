import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre").max(120),
  phone: z.string().min(7, "Teléfono inválido").max(30),
  email: z
    .string()
    .email("Correo inválido")
    .optional()
    .or(z.literal("")),
  message: z.string().min(5, "Escribe un mensaje").max(1000),
  propertyId: z.string().optional(),
  realtorId: z.string().optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

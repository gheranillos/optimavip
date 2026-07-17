import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto").max(120),
  email: z.string().email("Correo inválido"),
  phone: z.string().max(30).optional().or(z.literal("")),
  password: z.string().min(8, "Mínimo 8 caracteres").max(100),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

export const updateAdminSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "El nombre es muy corto").max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;

export const resetAdminPasswordSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(8, "Mínimo 8 caracteres").max(100),
});

export type ResetAdminPasswordInput = z.infer<typeof resetAdminPasswordSchema>;

export const changeAdminRoleSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["CLIENT", "REALTOR", "ADMIN"]),
});

export type ChangeAdminRoleInput = z.infer<typeof changeAdminRoleSchema>;

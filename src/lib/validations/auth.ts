import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "El nombre es muy corto").max(120),
    email: z.string().email("Correo inválido"),
    phone: z
      .string()
      .min(7, "Teléfono inválido")
      .max(30)
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Mínimo 8 caracteres").max(100),
    confirmPassword: z.string(),
    accountType: z.enum(["CLIENT", "REALTOR"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

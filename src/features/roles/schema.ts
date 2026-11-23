import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2, "Nama role minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9_]+$/, "Gunakan huruf kecil, angka, dan underscore saja"),
  description: z.string().min(4, "Deskripsi minimal 4 karakter"),
});

export type CreateRoleValues = z.infer<typeof createRoleSchema>;

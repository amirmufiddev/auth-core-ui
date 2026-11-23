import { z } from "zod";

export const usersSearchSchema = z.object({
  page: z.coerce.number().int().min(0).catch(0),
  pageSize: z.coerce.number().int().min(5).max(50).catch(10),
  search: z.string().catch(""),
  role: z.string().catch("all"),
  status: z.enum(["all", "active", "banned", "unverified"]).catch("all"),
  sortBy: z.string().catch("createdAt"),
  sortDir: z.enum(["asc", "desc"]).catch("desc"),
  view: z.enum(["list", "grid"]).catch("list"),
});

export type UsersSearchParams = z.infer<typeof usersSearchSchema>;

export const userFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  username: z.string().optional(),
  role: z.string().min(1, "Role wajib dipilih"),
  organizationName: z.string().optional(),
  emailVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const banUserSchema = z.object({
  banReason: z.string().min(4, "Alasan pembekuan minimal 4 karakter"),
  banExpires: z.date().optional(),
});

export type BanUserValues = z.infer<typeof banUserSchema>;

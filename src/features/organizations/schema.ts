import { z } from "zod";

export const organizationsSearchSchema = z.object({
  page: z.coerce.number().int().min(0).catch(0),
  pageSize: z.coerce.number().int().min(5).max(50).catch(10),
  search: z.string().catch(""),
});

export const createOrgSchema = z.object({
  name: z.string().min(2, "Nama organisasi minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  plan: z.enum(["Free", "Pro", "Enterprise"]),
  ssoEnabled: z.boolean(),
});

export const inviteOrgMemberSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["admin", "member"]),
});

export type OrganizationsSearchParams = z.infer<typeof organizationsSearchSchema>;
export type CreateOrgValues = z.infer<typeof createOrgSchema>;
export type InviteOrgMemberValues = z.infer<typeof inviteOrgMemberSchema>;

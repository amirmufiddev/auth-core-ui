import { z } from "zod";

export const apiKeysSearchSchema = z.object({
  tab: z.enum(["api-keys", "oauth-clients", "sso-scim"]).catch("api-keys"),
  page: z.coerce.number().int().min(0).catch(0),
  pageSize: z.coerce.number().int().min(5).max(50).catch(10),
  search: z.string().catch(""),
});

export const createApiKeySchema = z.object({
  name: z.string().min(2, "Nama API key minimal 2 karakter"),
  prefix: z.string().min(2, "Prefix minimal 2 karakter"),
  ownerEmail: z.string().email("Email pemilik tidak valid"),
  rateLimitMax: z.coerce.number().int().min(10).max(100000),
  scopes: z.array(z.string()).min(1, "Pilih minimal 1 scope"),
  expiresAt: z.date().optional(),
});

export const createOAuthClientSchema = z.object({
  name: z.string().min(2, "Nama klien minimal 2 karakter"),
  type: z.enum(["oidc-public", "oidc-confidential", "mcp-client"]),
  redirectUri: z.string().url("URL redirect harus valid (https:// atau http://)"),
  scopesText: z.string().min(2, "Masukkan minimal 1 scope"),
  pkceRequired: z.boolean(),
});

export const createSsoProviderSchema = z.object({
  name: z.string().min(2, "Nama provider minimal 2 karakter"),
  protocol: z.enum(["saml2", "oidc"]),
  domain: z.string().min(3, "Domain perusahaan wajib diisi"),
  organizationName: z.string().min(2, "Nama organisasi wajib diisi"),
  scimEnabled: z.boolean(),
});

export type ApiKeysSearchParams = z.infer<typeof apiKeysSearchSchema>;
export type CreateApiKeyValues = z.infer<typeof createApiKeySchema>;
export type CreateOAuthClientValues = z.infer<typeof createOAuthClientSchema>;
export type CreateSsoProviderValues = z.infer<typeof createSsoProviderSchema>;

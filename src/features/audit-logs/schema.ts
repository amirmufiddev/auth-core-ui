import { z } from "zod";

export const sessionsSearchSchema = z.object({
  page: z.coerce.number().int().min(0).catch(0),
  pageSize: z.coerce.number().int().min(5).max(50).catch(10),
  search: z.string().catch(""),
  status: z.enum(["all", "active", "expired"]).catch("all"),
  sinceDate: z.string().catch(""),
  sinceTime: z.string().catch(""),
});

export const auditLogsSearchSchema = z.object({
  search: z.string().catch(""),
  severity: z.enum(["all", "info", "warning", "critical"]).catch("all"),
  category: z
    .enum(["all", "auth", "admin", "rbac", "organization", "api-key", "config"])
    .catch("all"),
  fromDate: z.string().catch(""),
  toDate: z.string().catch(""),
});

export const authFeaturesSearchSchema = z.object({
  category: z
    .enum([
      "all",
      "core",
      "authentication",
      "social",
      "authorization",
      "enterprise",
      "utility",
      "payments",
    ])
    .catch("all"),
  status: z.enum(["all", "enabled", "disabled"]).catch("all"),
  search: z.string().catch(""),
});

export type SessionsSearchParams = z.infer<typeof sessionsSearchSchema>;
export type AuditLogsSearchParams = z.infer<typeof auditLogsSearchSchema>;
export type AuthFeaturesSearchParams = z.infer<typeof authFeaturesSearchSchema>;

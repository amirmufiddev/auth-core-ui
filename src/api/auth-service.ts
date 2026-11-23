import {
  type ApiKeyRecord,
  type AuditCategory,
  type AuditLogRecord,
  type AuditSeverity,
  type AuthUserRecord,
  type OAuthClientRecord,
  type OrganizationRecord,
  type SessionRecord,
  type SsoProviderRecord,
  appendAuditLog,
  readMockDb,
  writeMockDb,
} from "@/api/mock-db";
import { apiRequest, isExternalBackendConfigured } from "@/api/client";
import { type RolePermissionMatrix, type RoleRecord } from "@/lib/rbac";
import { assertFeatureEnabled } from "@/stores/useAuthConfigStore";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  status?: "all" | "active" | "banned" | "unverified";
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface DashboardMetrics {
  totalUsers: number;
  activeSessions: number;
  bannedUsers: number;
  twoFactorAdoption: number;
  authEvents24h: number;
  signInTrend: Array<{ date: string; signIns: number; tokensIssued: number }>;
  authMethodDistribution: Array<{ method: string; count: number }>;
  recentEvents: AuditLogRecord[];
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  if (isExternalBackendConfigured()) {
    try {
      return await apiRequest<DashboardMetrics>("/api/authcore/metrics");
    } catch {
      // fallback ke mock db bila backend custom endpoint belum tersedia
    }
  }

  const db = readMockDb();
  const totalUsers = db.users.length;
  const bannedUsers = db.users.filter((u) => u.banned).length;
  const twoFactorUsers = db.users.filter((u) => u.twoFactorEnabled).length;
  const activeSessions = db.sessions.filter((s) => s.active).length;

  const signInTrend = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date(Date.now() - (13 - idx) * 86400000);
    const label = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
    return {
      date: label,
      signIns: 180 + ((idx * 37) % 140),
      tokensIssued: 420 + ((idx * 61) % 240),
    };
  });

  const methodCountMap: Record<string, number> = {};
  for (const u of db.users) {
    const key = u.lastLoginMethod || "email";
    methodCountMap[key] = (methodCountMap[key] ?? 0) + 1;
  }

  const authMethodDistribution = Object.entries(methodCountMap).map(
    ([method, count]) => ({
      method: method.toUpperCase(),
      count: count * 24,
    }),
  );

  return {
    totalUsers,
    activeSessions,
    bannedUsers,
    twoFactorAdoption: Math.round(
      (twoFactorUsers / Math.max(1, totalUsers)) * 100,
    ),
    authEvents24h: 1428,
    signInTrend,
    authMethodDistribution,
    recentEvents: db.auditLogs.slice(0, 6),
  };
}

export async function listUsers(
  params: ListUsersParams,
): Promise<PaginatedResult<AuthUserRecord>> {
  const db = readMockDb();
  let list = [...db.users];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q),
    );
  }

  if (params.role && params.role !== "all") {
    list = list.filter((u) => u.role === params.role);
  }

  if (params.status && params.status !== "all") {
    if (params.status === "banned") list = list.filter((u) => u.banned);
    if (params.status === "active") list = list.filter((u) => !u.banned);
    if (params.status === "unverified")
      list = list.filter((u) => !u.emailVerified);
  }

  if (params.sortBy) {
    const dir = params.sortDir === "desc" ? -1 : 1;
    const key = params.sortBy as keyof AuthUserRecord;
    list.sort((a, b) => {
      const av = String(a[key] ?? "");
      const bv = String(b[key] ?? "");
      return av.localeCompare(bv) * dir;
    });
  }

  const total = list.length;
  const start = params.page * params.pageSize;
  const items = list.slice(start, start + params.pageSize);
  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function createUser(input: {
  name: string;
  email: string;
  username?: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  organizationName?: string;
}): Promise<AuthUserRecord> {
  assertFeatureEnabled("admin");
  const db = readMockDb();
  const exists = db.users.some(
    (u) => u.email.toLowerCase() === input.email.toLowerCase(),
  );
  if (exists) {
    throw new Error("Email sudah terdaftar.");
  }

  const created: AuthUserRecord = {
    id: `usr_${Date.now().toString(36)}`,
    name: input.name,
    email: input.email,
    username: input.username || input.email.split("@")[0],
    role: input.role,
    emailVerified: input.emailVerified,
    twoFactorEnabled: input.twoFactorEnabled,
    passkeyCount: 0,
    banned: false,
    organizationName: input.organizationName || "Auth Core HQ",
    lastLoginMethod: "email",
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  writeMockDb({
    ...db,
    users: [created, ...db.users],
  });

  appendAuditLog({
    event: "admin.user_created",
    category: "admin",
    severity: "info",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `user/${created.email}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { role: created.role },
  });

  return created;
}

export async function updateUser(
  userId: string,
  patch: Partial<
    Pick<
      AuthUserRecord,
      | "name"
      | "email"
      | "username"
      | "role"
      | "emailVerified"
      | "twoFactorEnabled"
      | "organizationName"
    >
  >,
): Promise<AuthUserRecord> {
  assertFeatureEnabled("admin");
  const db = readMockDb();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error("User tidak ditemukan.");

  const updated: AuthUserRecord = {
    ...db.users[index],
    ...patch,
  };
  const nextUsers = [...db.users];
  nextUsers[index] = updated;
  writeMockDb({ ...db, users: nextUsers });

  appendAuditLog({
    event: "admin.user_updated",
    category: "admin",
    severity: "info",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `user/${updated.email}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { role: updated.role },
  });

  return updated;
}

export async function banOrUnbanUser(input: {
  userId: string;
  banned: boolean;
  banReason?: string;
  banExpires?: string;
}): Promise<AuthUserRecord> {
  assertFeatureEnabled("admin");
  const db = readMockDb();
  const index = db.users.findIndex((u) => u.id === input.userId);
  if (index === -1) throw new Error("User tidak ditemukan.");

  const updated: AuthUserRecord = {
    ...db.users[index],
    banned: input.banned,
    banReason: input.banned ? input.banReason : undefined,
    banExpires: input.banned ? input.banExpires : undefined,
  };
  const nextUsers = [...db.users];
  nextUsers[index] = updated;
  writeMockDb({ ...db, users: nextUsers });

  appendAuditLog({
    event: input.banned ? "admin.user_banned" : "admin.user_unbanned",
    category: "admin",
    severity: input.banned ? "critical" : "warning",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `user/${updated.email}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { reason: input.banReason ?? "none" },
  });

  return updated;
}

export async function deleteUser(userId: string): Promise<void> {
  assertFeatureEnabled("admin");
  const db = readMockDb();
  const target = db.users.find((u) => u.id === userId);
  if (!target) throw new Error("User tidak ditemukan.");

  writeMockDb({
    ...db,
    users: db.users.filter((u) => u.id !== userId),
    sessions: db.sessions.filter((s) => s.userId !== userId),
  });

  appendAuditLog({
    event: "admin.user_deleted",
    category: "admin",
    severity: "critical",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `user/${target.email}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { userId },
  });
}

// ROLES & RBAC
export async function listRoles(): Promise<RoleRecord[]> {
  const db = readMockDb();
  return db.roles.map((r) => ({
    ...r,
    userCount: db.users.filter((u) => u.role === r.slug).length,
  }));
}

export async function createRole(input: {
  name: string;
  slug: string;
  description: string;
}): Promise<RoleRecord> {
  assertFeatureEnabled("admin");
  const db = readMockDb();
  if (db.roles.some((r) => r.slug === input.slug)) {
    throw new Error("Slug role sudah digunakan.");
  }

  const created: RoleRecord = {
    id: `role_${Date.now().toString(36)}`,
    name: input.name,
    slug: input.slug,
    description: input.description,
    isSystem: false,
    userCount: 0,
    permissions: {},
    updatedAt: new Date().toISOString(),
  };

  writeMockDb({ ...db, roles: [...db.roles, created] });
  appendAuditLog({
    event: "rbac.role_created",
    category: "rbac",
    severity: "info",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `role/${created.slug}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { name: created.name },
  });
  return created;
}

export async function updateRolePermissions(input: {
  roleId: string;
  name: string;
  description: string;
  permissions: RolePermissionMatrix;
}): Promise<RoleRecord> {
  assertFeatureEnabled("admin");
  const db = readMockDb();
  const idx = db.roles.findIndex((r) => r.id === input.roleId);
  if (idx === -1) throw new Error("Role tidak ditemukan.");

  const updated: RoleRecord = {
    ...db.roles[idx],
    name: input.name,
    description: input.description,
    permissions: input.permissions,
    updatedAt: new Date().toISOString(),
  };

  const nextRoles = [...db.roles];
  nextRoles[idx] = updated;
  writeMockDb({ ...db, roles: nextRoles });

  appendAuditLog({
    event: "rbac.permissions_updated",
    category: "rbac",
    severity: "warning",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `role/${updated.slug}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { roleId: updated.id },
  });
  return updated;
}

export async function deleteRole(roleId: string): Promise<void> {
  assertFeatureEnabled("admin");
  const db = readMockDb();
  const target = db.roles.find((r) => r.id === roleId);
  if (!target) throw new Error("Role tidak ditemukan.");
  if (target.isSystem) {
    throw new Error("Role sistem bawaan tidak dapat dihapus.");
  }
  writeMockDb({
    ...db,
    roles: db.roles.filter((r) => r.id !== roleId),
  });
  appendAuditLog({
    event: "rbac.role_deleted",
    category: "rbac",
    severity: "critical",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `role/${target.slug}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { roleId },
  });
}

// ORGANIZATIONS
export async function listOrganizations(params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PaginatedResult<OrganizationRecord>> {
  assertFeatureEnabled("organization");
  const db = readMockDb();
  let list = [...db.organizations];
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q),
    );
  }
  const total = list.length;
  const start = params.page * params.pageSize;
  return {
    items: list.slice(start, start + params.pageSize),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function createOrganization(input: {
  name: string;
  slug: string;
  plan: "Free" | "Pro" | "Enterprise";
  ssoEnabled: boolean;
}): Promise<OrganizationRecord> {
  assertFeatureEnabled("organization");
  const db = readMockDb();
  if (db.organizations.some((o) => o.slug === input.slug)) {
    throw new Error("Slug organisasi sudah dipakai.");
  }

  const created: OrganizationRecord = {
    id: `org_${Date.now().toString(36)}`,
    name: input.name,
    slug: input.slug,
    plan: input.plan,
    ssoEnabled: input.ssoEnabled,
    memberCount: 1,
    teamCount: 1,
    createdAt: new Date().toISOString(),
    members: [
      {
        id: `om_${Date.now().toString(36)}`,
        userId: "usr_01",
        name: "Raka Pratama",
        email: "admin@authcore.io",
        role: "owner",
        teamName: "General",
        joinedAt: new Date().toISOString(),
      },
    ],
    teams: [
      {
        id: `tm_${Date.now().toString(36)}`,
        name: "General",
        memberCount: 1,
        createdAt: new Date().toISOString(),
      },
    ],
    invitations: [],
  };

  writeMockDb({
    ...db,
    organizations: [created, ...db.organizations],
  });
  appendAuditLog({
    event: "organization.created",
    category: "organization",
    severity: "info",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `org/${created.slug}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { plan: created.plan },
  });
  return created;
}

export async function inviteOrganizationMember(input: {
  organizationId: string;
  email: string;
  role: "admin" | "member";
}): Promise<OrganizationRecord> {
  assertFeatureEnabled("organization");
  const db = readMockDb();
  const idx = db.organizations.findIndex((o) => o.id === input.organizationId);
  if (idx === -1) throw new Error("Organisasi tidak ditemukan.");

  const org = db.organizations[idx];
  const updated: OrganizationRecord = {
    ...org,
    invitations: [
      {
        id: `inv_${Date.now().toString(36)}`,
        email: input.email,
        role: input.role,
        status: "pending",
        expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      },
      ...org.invitations,
    ],
  };

  const next = [...db.organizations];
  next[idx] = updated;
  writeMockDb({ ...db, organizations: next });
  appendAuditLog({
    event: "organization.member_invited",
    category: "organization",
    severity: "info",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `org/${org.slug}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { invitee: input.email, role: input.role },
  });
  return updated;
}

export async function updateOrganization(
  organizationId: string,
  patch: Partial<
    Pick<OrganizationRecord, "name" | "slug" | "plan" | "ssoEnabled">
  >,
): Promise<OrganizationRecord> {
  assertFeatureEnabled("organization");
  const db = readMockDb();
  const idx = db.organizations.findIndex((o) => o.id === organizationId);
  if (idx === -1) throw new Error("Organisasi tidak ditemukan.");
  const updated: OrganizationRecord = {
    ...db.organizations[idx],
    ...patch,
  };
  const next = [...db.organizations];
  next[idx] = updated;
  writeMockDb({ ...db, organizations: next });
  return updated;
}

export async function updateOrganizationMemberRole(input: {
  organizationId: string;
  memberId: string;
  role: "owner" | "admin" | "member";
}): Promise<OrganizationRecord> {
  assertFeatureEnabled("organization");
  const db = readMockDb();
  const idx = db.organizations.findIndex((o) => o.id === input.organizationId);
  if (idx === -1) throw new Error("Organisasi tidak ditemukan.");
  const org = db.organizations[idx];
  const updated: OrganizationRecord = {
    ...org,
    members: org.members.map((m) =>
      m.id === input.memberId ? { ...m, role: input.role } : m,
    ),
  };
  const next = [...db.organizations];
  next[idx] = updated;
  writeMockDb({ ...db, organizations: next });
  return updated;
}

export async function removeOrganizationMember(input: {
  organizationId: string;
  memberId: string;
}): Promise<OrganizationRecord> {
  assertFeatureEnabled("organization");
  const db = readMockDb();
  const idx = db.organizations.findIndex((o) => o.id === input.organizationId);
  if (idx === -1) throw new Error("Organisasi tidak ditemukan.");
  const org = db.organizations[idx];
  const nextMembers = org.members.filter((m) => m.id !== input.memberId);
  const updated: OrganizationRecord = {
    ...org,
    members: nextMembers,
    memberCount: Math.max(0, org.memberCount - 1),
  };
  const next = [...db.organizations];
  next[idx] = updated;
  writeMockDb({ ...db, organizations: next });
  return updated;
}

export async function cancelOrganizationInvitation(input: {
  organizationId: string;
  invitationId: string;
}): Promise<OrganizationRecord> {
  assertFeatureEnabled("organization");
  const db = readMockDb();
  const idx = db.organizations.findIndex((o) => o.id === input.organizationId);
  if (idx === -1) throw new Error("Organisasi tidak ditemukan.");
  const org = db.organizations[idx];
  const updated: OrganizationRecord = {
    ...org,
    invitations: org.invitations.filter((i) => i.id !== input.invitationId),
  };
  const next = [...db.organizations];
  next[idx] = updated;
  writeMockDb({ ...db, organizations: next });
  return updated;
}

export async function deleteOrganization(
  organizationId: string,
): Promise<void> {
  assertFeatureEnabled("organization");
  const db = readMockDb();
  const target = db.organizations.find((o) => o.id === organizationId);
  writeMockDb({
    ...db,
    organizations: db.organizations.filter((o) => o.id !== organizationId),
  });
  if (target) {
    appendAuditLog({
      event: "organization.deleted",
      category: "organization",
      severity: "critical",
      actorEmail: "admin@authcore.io",
      actorRole: "super_admin",
      target: `org/${target.slug}`,
      ipAddress: "127.0.0.1",
      userAgent: navigator.userAgent,
      metadata: { organizationId },
    });
  }
}

// SESSIONS
export async function listSessions(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: "all" | "active" | "expired";
  sinceDate?: string;
}): Promise<PaginatedResult<SessionRecord>> {
  const db = readMockDb();
  let list = [...db.sessions];
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.userName.toLowerCase().includes(q) ||
        s.userEmail.toLowerCase().includes(q) ||
        s.ipAddress.toLowerCase().includes(q) ||
        s.userAgent.toLowerCase().includes(q),
    );
  }
  if (params.status === "active") list = list.filter((s) => s.active);
  if (params.status === "expired") list = list.filter((s) => !s.active);
  if (params.sinceDate) {
    const minTs = new Date(params.sinceDate).getTime();
    if (!Number.isNaN(minTs)) {
      list = list.filter((s) => new Date(s.createdAt).getTime() >= minTs);
    }
  }
  const total = list.length;
  const start = params.page * params.pageSize;
  return {
    items: list.slice(start, start + params.pageSize),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function revokeSession(sessionId: string): Promise<void> {
  const db = readMockDb();
  const target = db.sessions.find((s) => s.id === sessionId);
  if (!target) throw new Error("Sesi tidak ditemukan.");

  writeMockDb({
    ...db,
    sessions: db.sessions.map((s) =>
      s.id === sessionId ? { ...s, active: false } : s,
    ),
  });
  appendAuditLog({
    event: "session.revoked",
    category: "auth",
    severity: "warning",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `session/${target.tokenPreview}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { userEmail: target.userEmail },
  });
}

export async function revokeInactiveSessions(): Promise<number> {
  const db = readMockDb();
  const before = db.sessions.length;
  const remaining = db.sessions.filter((s) => s.active);
  writeMockDb({ ...db, sessions: remaining });
  return before - remaining.length;
}

// API KEYS, OAUTH CLIENTS, SSO
export async function listApiKeys(params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PaginatedResult<ApiKeyRecord>> {
  assertFeatureEnabled("apiKey");
  const db = readMockDb();
  let list = [...db.apiKeys];
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.ownerEmail.toLowerCase().includes(q) ||
        k.prefix.toLowerCase().includes(q),
    );
  }
  const total = list.length;
  const start = params.page * params.pageSize;
  return {
    items: list.slice(start, start + params.pageSize),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function createApiKey(input: {
  name: string;
  prefix: string;
  ownerEmail: string;
  scopes: string[];
  rateLimitMax: number;
  expiresAt?: string;
}): Promise<{ record: ApiKeyRecord; plainSecret: string }> {
  assertFeatureEnabled("apiKey");
  const db = readMockDb();
  const randomPart =
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 14);
  const plainSecret = `${input.prefix}${randomPart}`;
  const keyPreview = `${plainSecret.slice(0, input.prefix.length + 4)}••••••${plainSecret.slice(-4)}`;

  const record: ApiKeyRecord = {
    id: `key_${Date.now().toString(36)}`,
    name: input.name,
    prefix: input.prefix,
    keyPreview,
    ownerEmail: input.ownerEmail,
    scopes: input.scopes,
    rateLimitMax: input.rateLimitMax,
    rateLimitWindow: 60,
    enabled: true,
    requestCount: 0,
    expiresAt: input.expiresAt,
    createdAt: new Date().toISOString(),
  };

  writeMockDb({ ...db, apiKeys: [record, ...db.apiKeys] });
  appendAuditLog({
    event: "api_key.created",
    category: "api-key",
    severity: "info",
    actorEmail: "admin@authcore.io",
    actorRole: "super_admin",
    target: `key/${record.name}`,
    ipAddress: "127.0.0.1",
    userAgent: navigator.userAgent,
    metadata: { scopes: record.scopes.join(",") },
  });
  return { record, plainSecret };
}

export async function toggleApiKey(
  keyId: string,
  enabled: boolean,
): Promise<void> {
  assertFeatureEnabled("apiKey");
  const db = readMockDb();
  writeMockDb({
    ...db,
    apiKeys: db.apiKeys.map((k) => (k.id === keyId ? { ...k, enabled } : k)),
  });
}

export async function deleteApiKey(keyId: string): Promise<void> {
  assertFeatureEnabled("apiKey");
  const db = readMockDb();
  const target = db.apiKeys.find((k) => k.id === keyId);
  writeMockDb({
    ...db,
    apiKeys: db.apiKeys.filter((k) => k.id !== keyId),
  });
  if (target) {
    appendAuditLog({
      event: "api_key.revoked",
      category: "api-key",
      severity: "warning",
      actorEmail: "admin@authcore.io",
      actorRole: "super_admin",
      target: `key/${target.name}`,
      ipAddress: "127.0.0.1",
      userAgent: navigator.userAgent,
      metadata: { keyId },
    });
  }
}

export async function listOAuthClients(params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PaginatedResult<OAuthClientRecord>> {
  assertFeatureEnabled("oauthProvider");
  const db = readMockDb();
  let list = [...db.oauthClients];
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.clientId.toLowerCase().includes(q),
    );
  }
  const total = list.length;
  const start = params.page * params.pageSize;
  return {
    items: list.slice(start, start + params.pageSize),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function createOAuthClient(input: {
  name: string;
  type: OAuthClientRecord["type"];
  redirectUris: string[];
  scopes: string[];
  pkceRequired: boolean;
}): Promise<OAuthClientRecord> {
  assertFeatureEnabled("oauthProvider");
  const db = readMockDb();
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  const created: OAuthClientRecord = {
    id: `oa_${Date.now().toString(36)}`,
    clientId: `${slug}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    type: input.type,
    redirectUris: input.redirectUris,
    scopes: input.scopes,
    pkceRequired: input.pkceRequired,
    active: true,
    createdAt: new Date().toISOString(),
  };
  writeMockDb({ ...db, oauthClients: [created, ...db.oauthClients] });
  return created;
}

export async function listSsoProviders(): Promise<SsoProviderRecord[]> {
  assertFeatureEnabled("sso");
  return readMockDb().ssoProviders;
}

export async function createSsoProvider(input: {
  name: string;
  protocol: "saml2" | "oidc";
  domain: string;
  organizationName: string;
  scimEnabled: boolean;
}): Promise<SsoProviderRecord> {
  assertFeatureEnabled("sso");
  const db = readMockDb();
  const created: SsoProviderRecord = {
    id: `sso_${Date.now().toString(36)}`,
    providerId: `${input.protocol}-${input.domain.replace(/\./g, "-")}`,
    name: input.name,
    protocol: input.protocol,
    domain: input.domain,
    domainVerified: false,
    organizationName: input.organizationName,
    scimEnabled: input.scimEnabled,
    scimGroupMappings: [{ idpGroup: "Administrators", appRole: "org_manager" }],
    createdAt: new Date().toISOString(),
  };
  writeMockDb({ ...db, ssoProviders: [created, ...db.ssoProviders] });
  return created;
}

// AUDIT LOGS (Infinite Query Cursor Pagination)
export interface AuditLogPage {
  items: AuditLogRecord[];
  nextCursor: number | null;
  totalCount: number;
}

export async function fetchAuditLogsPage(params: {
  cursor: number;
  limit: number;
  search?: string;
  severity?: "all" | AuditSeverity;
  category?: "all" | AuditCategory;
  fromDate?: string;
  toDate?: string;
}): Promise<AuditLogPage> {
  assertFeatureEnabled("auditLogs");
  const db = readMockDb();
  let list = [...db.auditLogs];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (item) =>
        item.event.toLowerCase().includes(q) ||
        item.actorEmail.toLowerCase().includes(q) ||
        item.target.toLowerCase().includes(q) ||
        item.ipAddress.toLowerCase().includes(q),
    );
  }

  if (params.severity && params.severity !== "all") {
    list = list.filter((item) => item.severity === params.severity);
  }

  if (params.category && params.category !== "all") {
    list = list.filter((item) => item.category === params.category);
  }

  if (params.fromDate) {
    const minTime = new Date(params.fromDate).getTime();
    if (!Number.isNaN(minTime)) {
      list = list.filter(
        (item) => new Date(item.createdAt).getTime() >= minTime,
      );
    }
  }

  if (params.toDate) {
    const maxTime = new Date(`${params.toDate}T23:59:59.999`).getTime();
    if (!Number.isNaN(maxTime)) {
      list = list.filter(
        (item) => new Date(item.createdAt).getTime() <= maxTime,
      );
    }
  }

  const totalCount = list.length;
  const start = params.cursor;
  const end = start + params.limit;
  const items = list.slice(start, end);
  const nextCursor = end < totalCount ? end : null;

  return {
    items,
    nextCursor,
    totalCount,
  };
}

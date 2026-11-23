import { type RoleRecord } from "@/lib/rbac";

export interface AuthUserRecord {
  id: string;
  name: string;
  email: string;
  username?: string;
  phoneNumber?: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  passkeyCount: number;
  banned: boolean;
  banReason?: string;
  banExpires?: string;
  image?: string;
  organizationName?: string;
  lastLoginMethod: string;
  lastActiveAt: string;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  tokenPreview: string;
  ipAddress: string;
  userAgent: string;
  deviceType: "Desktop" | "Mobile" | "CLI" | "API";
  location: string;
  impersonatedBy?: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  teamName?: string;
  joinedAt: string;
}

export interface OrganizationTeam {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  plan: "Free" | "Pro" | "Enterprise";
  ssoEnabled: boolean;
  memberCount: number;
  teamCount: number;
  createdAt: string;
  members: OrganizationMember[];
  teams: OrganizationTeam[];
  invitations: OrganizationInvitation[];
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  keyPreview: string;
  ownerEmail: string;
  scopes: string[];
  rateLimitMax: number;
  rateLimitWindow: number;
  enabled: boolean;
  requestCount: number;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface OAuthClientRecord {
  id: string;
  clientId: string;
  name: string;
  type: "oidc-confidential" | "oidc-public" | "mcp-client";
  redirectUris: string[];
  scopes: string[];
  pkceRequired: boolean;
  active: boolean;
  createdAt: string;
}

export interface SsoProviderRecord {
  id: string;
  providerId: string;
  name: string;
  protocol: "saml2" | "oidc";
  domain: string;
  domainVerified: boolean;
  organizationName: string;
  scimEnabled: boolean;
  scimGroupMappings: Array<{ idpGroup: string; appRole: string }>;
  createdAt: string;
}

export type AuditSeverity = "info" | "warning" | "critical";
export type AuditCategory =
  | "auth"
  | "admin"
  | "rbac"
  | "organization"
  | "api-key"
  | "config";

export interface AuditLogRecord {
  id: string;
  event: string;
  category: AuditCategory;
  severity: AuditSeverity;
  actorEmail: string;
  actorRole: string;
  target: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  metadata: Record<string, string | number | boolean>;
}

export interface MockDatabaseState {
  users: AuthUserRecord[];
  roles: RoleRecord[];
  sessions: SessionRecord[];
  organizations: OrganizationRecord[];
  apiKeys: ApiKeyRecord[];
  oauthClients: OAuthClientRecord[];
  ssoProviders: SsoProviderRecord[];
  auditLogs: AuditLogRecord[];
}

const DB_STORAGE_KEY = "authcore-mock-db-v1";

function daysAgoIso(days: number, hoursOffset = 0): string {
  const date = new Date(Date.now() - days * 86400000 - hoursOffset * 3600000);
  return date.toISOString();
}

function daysAheadIso(days: number): string {
  const date = new Date(Date.now() + days * 86400000);
  return date.toISOString();
}

function buildInitialRoles(): RoleRecord[] {
  return [
    {
      id: "role_super_admin",
      name: "Super Admin",
      slug: "super_admin",
      description: "Akses penuh ke seluruh layanan AuthCore, RBAC, dan konfigurasi Better Auth.",
      isSystem: true,
      userCount: 2,
      updatedAt: daysAgoIso(1),
      permissions: {
        user: ["read", "create", "update", "delete", "ban", "impersonate"],
        session: ["read", "revoke"],
        role: ["read", "create", "update", "delete"],
        organization: ["read", "create", "update", "delete"],
        apiKey: ["read", "create", "update", "revoke"],
        oauthClient: ["read", "create", "update", "delete"],
        sso: ["read", "configure", "delete"],
        authConfig: ["read", "configure"],
        auditLog: ["read", "export"],
      },
    },
    {
      id: "role_security_admin",
      name: "Security Admin",
      slug: "security_admin",
      description: "Mengelola kebijakan 2FA, sesi aktif, API Key, SSO, dan audit log.",
      isSystem: true,
      userCount: 3,
      updatedAt: daysAgoIso(2),
      permissions: {
        user: ["read", "update", "ban"],
        session: ["read", "revoke"],
        role: ["read"],
        organization: ["read"],
        apiKey: ["read", "create", "update", "revoke"],
        oauthClient: ["read", "update"],
        sso: ["read", "configure"],
        authConfig: ["read", "configure"],
        auditLog: ["read", "export"],
      },
    },
    {
      id: "role_org_manager",
      name: "Org Manager",
      slug: "org_manager",
      description: "Mengelola tenant organisasi, tim, undangan member, dan kuota user.",
      isSystem: false,
      userCount: 4,
      updatedAt: daysAgoIso(4),
      permissions: {
        user: ["read", "create", "update"],
        session: ["read"],
        role: ["read"],
        organization: ["read", "create", "update"],
        apiKey: ["read"],
        auditLog: ["read"],
      },
    },
    {
      id: "role_support_agent",
      name: "Support Agent",
      slug: "support_agent",
      description: "Membantu troubleshooting user termasuk impersonation & pencabutan sesi.",
      isSystem: false,
      userCount: 5,
      updatedAt: daysAgoIso(7),
      permissions: {
        user: ["read", "update", "impersonate"],
        session: ["read", "revoke"],
        organization: ["read"],
        auditLog: ["read"],
      },
    },
    {
      id: "role_auditor",
      name: "Compliance Auditor",
      slug: "auditor",
      description: "Akses read-only ke user, role, SSO, konfigurasi, dan ekspor audit log.",
      isSystem: false,
      userCount: 2,
      updatedAt: daysAgoIso(10),
      permissions: {
        user: ["read"],
        session: ["read"],
        role: ["read"],
        organization: ["read"],
        apiKey: ["read"],
        oauthClient: ["read"],
        sso: ["read"],
        authConfig: ["read"],
        auditLog: ["read", "export"],
      },
    },
    {
      id: "role_user",
      name: "Standard User",
      slug: "user",
      description: "Role default pengguna aplikasi tanpa hak akses konsol admin.",
      isSystem: true,
      userCount: 12,
      updatedAt: daysAgoIso(15),
      permissions: {},
    },
  ];
}

function buildInitialUsers(): AuthUserRecord[] {
  const seed: Array<Partial<AuthUserRecord> & { id: string; name: string; email: string; role: string }> = [
    { id: "usr_01", name: "Raka Pratama", email: "admin@authcore.io", username: "rakapratama", role: "super_admin", twoFactorEnabled: true, passkeyCount: 2, emailVerified: true, organizationName: "AuthCore HQ", lastLoginMethod: "passkey", lastActiveAt: daysAgoIso(0, 1) },
    { id: "usr_02", name: "Nadia Kusuma", email: "nadia@authcore.io", username: "nadiakusuma", role: "super_admin", twoFactorEnabled: true, passkeyCount: 1, emailVerified: true, organizationName: "AuthCore HQ", lastLoginMethod: "email", lastActiveAt: daysAgoIso(0, 2) },
    { id: "usr_03", name: "Dimas Wijaya", email: "dimas.sec@authcore.io", username: "dimasw", role: "security_admin", twoFactorEnabled: true, passkeyCount: 1, emailVerified: true, organizationName: "AuthCore HQ", lastLoginMethod: "google", lastActiveAt: daysAgoIso(0, 4) },
    { id: "usr_04", name: "Siti Rahmawati", email: "siti@galonin.id", username: "sitirahma", role: "org_manager", twoFactorEnabled: true, passkeyCount: 0, emailVerified: true, organizationName: "Galonin Logistics", lastLoginMethod: "email", lastActiveAt: daysAgoIso(0, 6) },
    { id: "usr_05", name: "Bagus Santoso", email: "bagus@galonin.id", username: "baguss", role: "support_agent", twoFactorEnabled: false, passkeyCount: 0, emailVerified: true, organizationName: "Galonin Logistics", lastLoginMethod: "magic-link", lastActiveAt: daysAgoIso(1, 2) },
    { id: "usr_06", name: "Clara Wijaya", email: "clara@nusantara.dev", username: "claraw", role: "org_manager", twoFactorEnabled: true, passkeyCount: 2, emailVerified: true, organizationName: "Nusantara Cloud", lastLoginMethod: "github", lastActiveAt: daysAgoIso(1, 5) },
    { id: "usr_07", name: "Fajar Hidayat", email: "fajar@nusantara.dev", username: "fajarh", role: "security_admin", twoFactorEnabled: true, passkeyCount: 1, emailVerified: true, organizationName: "Nusantara Cloud", lastLoginMethod: "passkey", lastActiveAt: daysAgoIso(2, 1) },
    { id: "usr_08", name: "Dewi Lestari", email: "dewi@karsa.co.id", username: "dewilestari", role: "auditor", twoFactorEnabled: true, passkeyCount: 0, emailVerified: true, organizationName: "Karsa FinTech", lastLoginMethod: "sso", lastActiveAt: daysAgoIso(2, 8) },
    { id: "usr_09", name: "Hendra Gunawan", email: "hendra@karsa.co.id", username: "hendrag", role: "user", twoFactorEnabled: false, passkeyCount: 0, emailVerified: true, organizationName: "Karsa FinTech", lastLoginMethod: "email-otp", lastActiveAt: daysAgoIso(3) },
    { id: "usr_10", name: "Putri Maharani", email: "putri@authcore.io", username: "putrim", role: "support_agent", twoFactorEnabled: true, passkeyCount: 1, emailVerified: true, organizationName: "AuthCore HQ", lastLoginMethod: "google", lastActiveAt: daysAgoIso(3, 4) },
    { id: "usr_11", name: "Arif Rahman", email: "arif@galonin.id", username: "arifr", role: "user", twoFactorEnabled: false, passkeyCount: 0, emailVerified: true, banned: true, banReason: "Percobaan credential stuffing berulang", banExpires: daysAheadIso(14), organizationName: "Galonin Logistics", lastLoginMethod: "email", lastActiveAt: daysAgoIso(4) },
    { id: "usr_12", name: "Maya Puspita", email: "maya@nusantara.dev", username: "mayap", role: "user", twoFactorEnabled: true, passkeyCount: 1, emailVerified: true, organizationName: "Nusantara Cloud", lastLoginMethod: "github", lastActiveAt: daysAgoIso(4, 5) },
    { id: "usr_13", name: "Yoga Pratama", email: "yoga@karsa.co.id", username: "yogap", role: "user", twoFactorEnabled: false, passkeyCount: 0, emailVerified: false, organizationName: "Karsa FinTech", lastLoginMethod: "email", lastActiveAt: daysAgoIso(5) },
    { id: "usr_14", name: "Tania Salim", email: "tania@authcore.io", username: "tanias", role: "security_admin", twoFactorEnabled: true, passkeyCount: 2, emailVerified: true, organizationName: "AuthCore HQ", lastLoginMethod: "passkey", lastActiveAt: daysAgoIso(5, 3) },
    { id: "usr_15", name: "Reza Mahendra", email: "reza@galonin.id", username: "rezam", role: "user", twoFactorEnabled: false, passkeyCount: 0, emailVerified: true, organizationName: "Galonin Logistics", lastLoginMethod: "magic-link", lastActiveAt: daysAgoIso(6) },
    { id: "usr_16", name: "Intan Permata", email: "intan@nusantara.dev", username: "intanp", role: "org_manager", twoFactorEnabled: true, passkeyCount: 0, emailVerified: true, organizationName: "Nusantara Cloud", lastLoginMethod: "google", lastActiveAt: daysAgoIso(6, 7) },
    { id: "usr_17", name: "Bima Sakti", email: "bima@karsa.co.id", username: "bimas", role: "user", twoFactorEnabled: false, passkeyCount: 0, emailVerified: true, banned: true, banReason: "Pelanggaran kebijakan API rate limit", organizationName: "Karsa FinTech", lastLoginMethod: "email", lastActiveAt: daysAgoIso(7) },
    { id: "usr_18", name: "Larasati Putri", email: "laras@authcore.io", username: "larasp", role: "auditor", twoFactorEnabled: true, passkeyCount: 1, emailVerified: true, organizationName: "AuthCore HQ", lastLoginMethod: "sso", lastActiveAt: daysAgoIso(8) },
    { id: "usr_19", name: "Kevin Setiawan", email: "kevin@galonin.id", username: "kevins", role: "support_agent", twoFactorEnabled: false, passkeyCount: 0, emailVerified: true, organizationName: "Galonin Logistics", lastLoginMethod: "email", lastActiveAt: daysAgoIso(9) },
    { id: "usr_20", name: "Aulia Rahma", email: "aulia@nusantara.dev", username: "auliar", role: "user", twoFactorEnabled: true, passkeyCount: 1, emailVerified: true, organizationName: "Nusantara Cloud", lastLoginMethod: "passkey", lastActiveAt: daysAgoIso(10) },
    { id: "usr_21", name: "Gilang Ramadhan", email: "gilang@karsa.co.id", username: "gilangr", role: "user", twoFactorEnabled: false, passkeyCount: 0, emailVerified: false, organizationName: "Karsa FinTech", lastLoginMethod: "email-otp", lastActiveAt: daysAgoIso(11) },
    { id: "usr_22", name: "Vina Oktaviani", email: "vina@authcore.io", username: "vinao", role: "support_agent", twoFactorEnabled: true, passkeyCount: 0, emailVerified: true, organizationName: "AuthCore HQ", lastLoginMethod: "google", lastActiveAt: daysAgoIso(12) },
    { id: "usr_23", name: "Ilham Fauzi", email: "ilham@galonin.id", username: "ilhamf", role: "org_manager", twoFactorEnabled: true, passkeyCount: 1, emailVerified: true, organizationName: "Galonin Logistics", lastLoginMethod: "github", lastActiveAt: daysAgoIso(13) },
    { id: "usr_24", name: "Nabila Azzahra", email: "nabila@nusantara.dev", username: "nabilaa", role: "user", twoFactorEnabled: false, passkeyCount: 0, emailVerified: true, organizationName: "Nusantara Cloud", lastLoginMethod: "email", lastActiveAt: daysAgoIso(14) },
    { id: "usr_25", name: "Rizky Darmawan", email: "rizky@karsa.co.id", username: "rizkyd", role: "support_agent", twoFactorEnabled: true, passkeyCount: 0, emailVerified: true, organizationName: "Karsa FinTech", lastLoginMethod: "sso", lastActiveAt: daysAgoIso(15) },
    { id: "usr_26", name: "Dina Kartika", email: "dina@galonin.id", username: "dinak", role: "user", twoFactorEnabled: false, passkeyCount: 0, emailVerified: true, organizationName: "Galonin Logistics", lastLoginMethod: "email", lastActiveAt: daysAgoIso(16) },
    { id: "usr_27", name: "Hafiz Maulana", email: "hafiz@nusantara.dev", username: "hafizm", role: "user", twoFactorEnabled: true, passkeyCount: 1, emailVerified: true, organizationName: "Nusantara Cloud", lastLoginMethod: "passkey", lastActiveAt: daysAgoIso(18) },
    { id: "usr_28", name: "Sari Indah", email: "sari@karsa.co.id", username: "sarii", role: "user", twoFactorEnabled: false, passkeyCount: 0, emailVerified: true, organizationName: "Karsa FinTech", lastLoginMethod: "magic-link", lastActiveAt: daysAgoIso(20) },
  ];

  return seed.map((u, idx) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    phoneNumber: `+62812${String(1000000 + idx * 1379).slice(0, 7)}`,
    role: u.role,
    emailVerified: u.emailVerified ?? true,
    twoFactorEnabled: u.twoFactorEnabled ?? false,
    passkeyCount: u.passkeyCount ?? 0,
    banned: u.banned ?? false,
    banReason: u.banReason,
    banExpires: u.banExpires,
    organizationName: u.organizationName ?? "AuthCore HQ",
    lastLoginMethod: u.lastLoginMethod ?? "email",
    lastActiveAt: u.lastActiveAt ?? daysAgoIso(idx),
    createdAt: daysAgoIso(30 + idx * 2),
  }));
}

function buildInitialSessions(): SessionRecord[] {
  return [
    {
      id: "ses_01",
      userId: "usr_01",
      userName: "Raka Pratama",
      userEmail: "admin@authcore.io",
      tokenPreview: "ba_ses_9f82...e41c",
      ipAddress: "103.147.22.14",
      userAgent: "Chrome 134 · macOS Sonoma",
      deviceType: "Desktop",
      location: "Jakarta, ID",
      createdAt: daysAgoIso(0, 3),
      expiresAt: daysAheadIso(7),
      active: true,
    },
    {
      id: "ses_02",
      userId: "usr_02",
      userName: "Nadia Kusuma",
      userEmail: "nadia@authcore.io",
      tokenPreview: "ba_ses_3a19...9b02",
      ipAddress: "182.253.112.40",
      userAgent: "Firefox 136 · Ubuntu Linux",
      deviceType: "Desktop",
      location: "Bandung, ID",
      createdAt: daysAgoIso(0, 5),
      expiresAt: daysAheadIso(6),
      active: true,
    },
    {
      id: "ses_03",
      userId: "usr_03",
      userName: "Dimas Wijaya",
      userEmail: "dimas.sec@authcore.io",
      tokenPreview: "ba_ses_7c44...118a",
      ipAddress: "36.85.211.98",
      userAgent: "Safari 18 · iPhone 16 Pro",
      deviceType: "Mobile",
      location: "Surabaya, ID",
      createdAt: daysAgoIso(0, 8),
      expiresAt: daysAheadIso(6),
      active: true,
    },
    {
      id: "ses_04",
      userId: "usr_04",
      userName: "Siti Rahmawati",
      userEmail: "siti@galonin.id",
      tokenPreview: "ba_ses_6b01...773f",
      ipAddress: "114.122.45.12",
      userAgent: "Edge 134 · Windows 11",
      deviceType: "Desktop",
      location: "Jakarta, ID",
      createdAt: daysAgoIso(1, 1),
      expiresAt: daysAheadIso(5),
      active: true,
    },
    {
      id: "ses_05",
      userId: "usr_05",
      userName: "Bagus Santoso",
      userEmail: "bagus@galonin.id",
      tokenPreview: "ba_ses_441d...0c9e",
      ipAddress: "103.28.114.77",
      userAgent: "AuthCore CLI v1.7 (Device Flow)",
      deviceType: "CLI",
      location: "Yogyakarta, ID",
      impersonatedBy: "admin@authcore.io",
      createdAt: daysAgoIso(1, 6),
      expiresAt: daysAheadIso(4),
      active: true,
    },
    {
      id: "ses_06",
      userId: "usr_06",
      userName: "Clara Wijaya",
      userEmail: "clara@nusantara.dev",
      tokenPreview: "ba_ses_52aa...8d10",
      ipAddress: "202.43.168.19",
      userAgent: "Chrome 134 · Android 15",
      deviceType: "Mobile",
      location: "Singapore, SG",
      createdAt: daysAgoIso(2, 2),
      expiresAt: daysAheadIso(5),
      active: true,
    },
    {
      id: "ses_07",
      userId: "usr_08",
      userName: "Dewi Lestari",
      userEmail: "dewi@karsa.co.id",
      tokenPreview: "ba_ses_190f...442b",
      ipAddress: "103.11.67.204",
      userAgent: "Chrome 133 · Windows 11",
      deviceType: "Desktop",
      location: "Jakarta, ID",
      createdAt: daysAgoIso(3, 4),
      expiresAt: daysAheadIso(3),
      active: true,
    },
    {
      id: "ses_08",
      userId: "usr_14",
      userName: "Tania Salim",
      userEmail: "tania@authcore.io",
      tokenPreview: "ba_ses_8e77...5a31",
      ipAddress: "180.244.19.88",
      userAgent: "Arc Browser · macOS Sequoia",
      deviceType: "Desktop",
      location: "Tangerang, ID",
      createdAt: daysAgoIso(5, 2),
      expiresAt: daysAgoIso(0, 1),
      active: false,
    },
  ];
}

function buildInitialOrganizations(): OrganizationRecord[] {
  return [
    {
      id: "org_01",
      name: "AuthCore HQ",
      slug: "authcore-hq",
      plan: "Enterprise",
      ssoEnabled: true,
      memberCount: 7,
      teamCount: 3,
      createdAt: daysAgoIso(120),
      members: [
        { id: "om_1", userId: "usr_01", name: "Raka Pratama", email: "admin@authcore.io", role: "owner", teamName: "Platform Core", joinedAt: daysAgoIso(120) },
        { id: "om_2", userId: "usr_02", name: "Nadia Kusuma", email: "nadia@authcore.io", role: "admin", teamName: "Platform Core", joinedAt: daysAgoIso(110) },
        { id: "om_3", userId: "usr_03", name: "Dimas Wijaya", email: "dimas.sec@authcore.io", role: "admin", teamName: "Security Ops", joinedAt: daysAgoIso(95) },
        { id: "om_4", userId: "usr_10", name: "Putri Maharani", email: "putri@authcore.io", role: "member", teamName: "Support Tier 2", joinedAt: daysAgoIso(60) },
      ],
      teams: [
        { id: "tm_1", name: "Platform Core", memberCount: 3, createdAt: daysAgoIso(120) },
        { id: "tm_2", name: "Security Ops", memberCount: 2, createdAt: daysAgoIso(95) },
        { id: "tm_3", name: "Support Tier 2", memberCount: 2, createdAt: daysAgoIso(60) },
      ],
      invitations: [
        { id: "inv_1", email: "devsecops@authcore.io", role: "admin", status: "pending", expiresAt: daysAheadIso(2) },
      ],
    },
    {
      id: "org_02",
      name: "Galonin Logistics",
      slug: "galonin-logistics",
      plan: "Pro",
      ssoEnabled: true,
      memberCount: 7,
      teamCount: 2,
      createdAt: daysAgoIso(90),
      members: [
        { id: "om_5", userId: "usr_04", name: "Siti Rahmawati", email: "siti@galonin.id", role: "owner", teamName: "Operations", joinedAt: daysAgoIso(90) },
        { id: "om_6", userId: "usr_05", name: "Bagus Santoso", email: "bagus@galonin.id", role: "admin", teamName: "Fleet Dispatch", joinedAt: daysAgoIso(80) },
        { id: "om_7", userId: "usr_23", name: "Ilham Fauzi", email: "ilham@galonin.id", role: "member", teamName: "Operations", joinedAt: daysAgoIso(45) },
      ],
      teams: [
        { id: "tm_4", name: "Operations", memberCount: 4, createdAt: daysAgoIso(90) },
        { id: "tm_5", name: "Fleet Dispatch", memberCount: 3, createdAt: daysAgoIso(75) },
      ],
      invitations: [
        { id: "inv_2", email: "warehouse@galonin.id", role: "member", status: "pending", expiresAt: daysAheadIso(1) },
      ],
    },
    {
      id: "org_03",
      name: "Nusantara Cloud",
      slug: "nusantara-cloud",
      plan: "Enterprise",
      ssoEnabled: true,
      memberCount: 7,
      teamCount: 2,
      createdAt: daysAgoIso(75),
      members: [
        { id: "om_8", userId: "usr_06", name: "Clara Wijaya", email: "clara@nusantara.dev", role: "owner", teamName: "Cloud Infra", joinedAt: daysAgoIso(75) },
        { id: "om_9", userId: "usr_07", name: "Fajar Hidayat", email: "fajar@nusantara.dev", role: "admin", teamName: "IAM Team", joinedAt: daysAgoIso(70) },
      ],
      teams: [
        { id: "tm_6", name: "Cloud Infra", memberCount: 4, createdAt: daysAgoIso(75) },
        { id: "tm_7", name: "IAM Team", memberCount: 3, createdAt: daysAgoIso(70) },
      ],
      invitations: [],
    },
    {
      id: "org_04",
      name: "Karsa FinTech",
      slug: "karsa-fintech",
      plan: "Pro",
      ssoEnabled: false,
      memberCount: 7,
      teamCount: 2,
      createdAt: daysAgoIso(45),
      members: [
        { id: "om_10", userId: "usr_08", name: "Dewi Lestari", email: "dewi@karsa.co.id", role: "owner", teamName: "Compliance", joinedAt: daysAgoIso(45) },
        { id: "om_11", userId: "usr_25", name: "Rizky Darmawan", email: "rizky@karsa.co.id", role: "member", teamName: "Customer Care", joinedAt: daysAgoIso(30) },
      ],
      teams: [
        { id: "tm_8", name: "Compliance", memberCount: 3, createdAt: daysAgoIso(45) },
        { id: "tm_9", name: "Customer Care", memberCount: 4, createdAt: daysAgoIso(30) },
      ],
      invitations: [],
    },
  ];
}

function buildInitialApiKeys(): ApiKeyRecord[] {
  return [
    {
      id: "key_01",
      name: "Galonin Core Microservice",
      prefix: "ak_live_",
      keyPreview: "ak_live_98ab••••••72e1",
      ownerEmail: "admin@authcore.io",
      scopes: ["users:read", "sessions:verify", "tokens:introspect"],
      rateLimitMax: 1000,
      rateLimitWindow: 60,
      enabled: true,
      requestCount: 184920,
      lastUsedAt: daysAgoIso(0, 1),
      expiresAt: daysAheadIso(180),
      createdAt: daysAgoIso(60),
    },
    {
      id: "key_02",
      name: "Billing Webhook Worker",
      prefix: "ak_live_",
      keyPreview: "ak_live_44c2••••••19b0",
      ownerEmail: "dimas.sec@authcore.io",
      scopes: ["orgs:read", "audit:write"],
      rateLimitMax: 300,
      rateLimitWindow: 60,
      enabled: true,
      requestCount: 42110,
      lastUsedAt: daysAgoIso(0, 3),
      expiresAt: daysAheadIso(90),
      createdAt: daysAgoIso(40),
    },
    {
      id: "key_03",
      name: "Analytics Warehouse Sync",
      prefix: "ak_ro_",
      keyPreview: "ak_ro_771d••••••05aa",
      ownerEmail: "dewi@karsa.co.id",
      scopes: ["audit:read", "users:read"],
      rateLimitMax: 120,
      rateLimitWindow: 60,
      enabled: false,
      requestCount: 9120,
      lastUsedAt: daysAgoIso(5),
      expiresAt: daysAheadIso(30),
      createdAt: daysAgoIso(25),
    },
  ];
}

function buildInitialOAuthClients(): OAuthClientRecord[] {
  return [
    {
      id: "oa_01",
      clientId: "authcore_dashboard_spa",
      name: "Galonin Operations Web",
      type: "oidc-public",
      redirectUris: ["https://ops.galonin.id/callback", "http://localhost:5173/callback"],
      scopes: ["openid", "profile", "email", "offline_access"],
      pkceRequired: true,
      active: true,
      createdAt: daysAgoIso(80),
    },
    {
      id: "oa_02",
      clientId: "karsa_settlement_bff",
      name: "Karsa Settlement BFF",
      type: "oidc-confidential",
      redirectUris: ["https://settlement.karsa.co.id/api/auth/callback"],
      scopes: ["openid", "profile", "email", "orgs:read"],
      pkceRequired: true,
      active: true,
      createdAt: daysAgoIso(50),
    },
    {
      id: "oa_03",
      clientId: "mcp_claude_desktop_connector",
      name: "AuthCore MCP Agent Client",
      type: "mcp-client",
      redirectUris: ["http://127.0.0.1:6274/oauth/callback"],
      scopes: ["openid", "mcp:tools", "users:read"],
      pkceRequired: true,
      active: true,
      createdAt: daysAgoIso(14),
    },
  ];
}

function buildInitialSsoProviders(): SsoProviderRecord[] {
  return [
    {
      id: "sso_01",
      providerId: "okta-nusantara-saml",
      name: "Okta Enterprise SAML",
      protocol: "saml2",
      domain: "nusantara.dev",
      domainVerified: true,
      organizationName: "Nusantara Cloud",
      scimEnabled: true,
      scimGroupMappings: [
        { idpGroup: "IAM-Admins", appRole: "security_admin" },
        { idpGroup: "Cloud-Engineers", appRole: "org_manager" },
      ],
      createdAt: daysAgoIso(65),
    },
    {
      id: "sso_02",
      providerId: "entra-galonin-oidc",
      name: "Microsoft Entra ID OIDC",
      protocol: "oidc",
      domain: "galonin.id",
      domainVerified: true,
      organizationName: "Galonin Logistics",
      scimEnabled: false,
      scimGroupMappings: [
        { idpGroup: "Fleet-Managers", appRole: "org_manager" },
      ],
      createdAt: daysAgoIso(35),
    },
  ];
}

function buildInitialAuditLogs(): AuditLogRecord[] {
  const events: Array<{
    event: string;
    category: AuditCategory;
    severity: AuditSeverity;
    target: string;
  }> = [
    { event: "user.signed_in.passkey", category: "auth", severity: "info", target: "session/web" },
    { event: "user.signed_in.email", category: "auth", severity: "info", target: "session/web" },
    { event: "two_factor.verified", category: "auth", severity: "info", target: "totp/6-digit" },
    { event: "admin.role_updated", category: "rbac", severity: "warning", target: "role/org_manager" },
    { event: "admin.user_banned", category: "admin", severity: "critical", target: "user/usr_11" },
    { event: "admin.impersonation_started", category: "admin", severity: "warning", target: "user/usr_05" },
    { event: "api_key.created", category: "api-key", severity: "info", target: "key/ak_live_98ab" },
    { event: "api_key.rate_limit_exceeded", category: "api-key", severity: "warning", target: "key/ak_live_44c2" },
    { event: "organization.member_invited", category: "organization", severity: "info", target: "org/galonin-logistics" },
    { event: "auth_config.plugin_toggled", category: "config", severity: "warning", target: "plugin/passkey" },
    { event: "session.revoked", category: "auth", severity: "info", target: "session/ses_08" },
    { event: "security.hibp_password_blocked", category: "auth", severity: "critical", target: "signup/email" },
  ];

  const actors = [
    { email: "admin@authcore.io", role: "super_admin" },
    { email: "nadia@authcore.io", role: "super_admin" },
    { email: "dimas.sec@authcore.io", role: "security_admin" },
    { email: "siti@galonin.id", role: "org_manager" },
    { email: "clara@nusantara.dev", role: "org_manager" },
    { email: "dewi@karsa.co.id", role: "auditor" },
    { email: "bagus@galonin.id", role: "support_agent" },
  ];

  const userAgents = [
    "Chrome/134.0 macOS",
    "Firefox/136.0 Linux",
    "Safari/18.0 iOS",
    "Edge/134.0 Windows",
    "AuthCore-SDK/1.7 Node",
  ];

  const logs: AuditLogRecord[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < 540; i++) {
    const template = events[i % events.length];
    const actor = actors[i % actors.length];
    const createdAt = new Date(baseTime - i * 18 * 60000).toISOString();
    logs.push({
      id: `aud_${String(540 - i).padStart(4, "0")}`,
      event: template.event,
      category: template.category,
      severity: template.severity,
      actorEmail: actor.email,
      actorRole: actor.role,
      target: template.target,
      ipAddress: `103.${(120 + (i % 80))}.${(10 + (i % 200))}.${(2 + (i % 240))}`,
      userAgent: userAgents[i % userAgents.length],
      createdAt,
      metadata: {
        requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
        latencyMs: 12 + (i % 48),
        pluginVersion: "1.7.0",
        success: template.severity !== "critical" || i % 3 === 0,
      },
    });
  }

  return logs;
}

export function createInitialMockDb(): MockDatabaseState {
  return {
    users: buildInitialUsers(),
    roles: buildInitialRoles(),
    sessions: buildInitialSessions(),
    organizations: buildInitialOrganizations(),
    apiKeys: buildInitialApiKeys(),
    oauthClients: buildInitialOAuthClients(),
    ssoProviders: buildInitialSsoProviders(),
    auditLogs: buildInitialAuditLogs(),
  };
}

let memoryDb: MockDatabaseState | null = null;

export function readMockDb(): MockDatabaseState {
  if (memoryDb) return memoryDb;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(DB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MockDatabaseState;
        if (Array.isArray(parsed.users) && Array.isArray(parsed.auditLogs)) {
          memoryDb = parsed;
          return memoryDb;
        }
      }
    } catch {
      // fallback to fresh seed
    }
  }
  memoryDb = createInitialMockDb();
  writeMockDb(memoryDb);
  return memoryDb;
}

export function writeMockDb(next: MockDatabaseState): void {
  memoryDb = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  }
}

export function appendAuditLog(
  entry: Omit<AuditLogRecord, "id" | "createdAt">
): AuditLogRecord {
  const db = readMockDb();
  const created: AuditLogRecord = {
    ...entry,
    id: `aud_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  writeMockDb({
    ...db,
    auditLogs: [created, ...db.auditLogs].slice(0, 800),
  });
  return created;
}

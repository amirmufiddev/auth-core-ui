export type RbacResource =
  | "user"
  | "session"
  | "role"
  | "organization"
  | "apiKey"
  | "oauthClient"
  | "sso"
  | "authConfig"
  | "auditLog";

export interface RbacPermissionOption {
  action: string;
  label: string;
  description: string;
}

export interface RbacResourceModule {
  resource: RbacResource;
  title: string;
  description: string;
  permissions: RbacPermissionOption[];
}

export const RBAC_RESOURCE_MODULES: RbacResourceModule[] = [
  {
    resource: "user",
    title: "Users Management",
    description: "Kontrol akun pengguna, ban/unban, dan impersonation sesi.",
    permissions: [
      {
        action: "read",
        label: "Read Users",
        description: "Melihat daftar dan profil user",
      },
      {
        action: "create",
        label: "Create Users",
        description: "Membuat akun user baru",
      },
      {
        action: "update",
        label: "Update Users",
        description: "Mengubah profil, password & verifikasi",
      },
      {
        action: "delete",
        label: "Delete Users",
        description: "Menghapus akun user permanen",
      },
      {
        action: "ban",
        label: "Ban / Unban",
        description: "Membekukan atau memulihkan akses user",
      },
      {
        action: "impersonate",
        label: "Impersonate",
        description: "Masuk sebagai user untuk dukungan teknis",
      },
    ],
  },
  {
    resource: "session",
    title: "Sessions & Devices",
    description: "Visibilitas dan pencabutan sesi aktif perangkat.",
    permissions: [
      {
        action: "read",
        label: "List Sessions",
        description: "Melihat sesi aktif semua perangkat",
      },
      {
        action: "revoke",
        label: "Revoke Sessions",
        description: "Mencabut token sesi secara paksa",
      },
    ],
  },
  {
    resource: "role",
    title: "Roles & Access Control",
    description: "Pengaturan definisi role dan matriks permission RBAC.",
    permissions: [
      {
        action: "read",
        label: "Read Roles",
        description: "Melihat daftar role & hak akses",
      },
      {
        action: "create",
        label: "Create Roles",
        description: "Menambahkan role kustom baru",
      },
      {
        action: "update",
        label: "Update Roles",
        description: "Mengubah permission pada role",
      },
      {
        action: "delete",
        label: "Delete Roles",
        description: "Menghapus role kustom",
      },
    ],
  },
  {
    resource: "organization",
    title: "Organizations & Teams",
    description: "Manajemen tenant, anggota, tim, dan undangan.",
    permissions: [
      {
        action: "read",
        label: "Read Orgs",
        description: "Melihat daftar organisasi & member",
      },
      {
        action: "create",
        label: "Create Orgs",
        description: "Membuat organisasi baru",
      },
      {
        action: "update",
        label: "Update Orgs",
        description: "Mengelola member, tim & undangan",
      },
      {
        action: "delete",
        label: "Delete Orgs",
        description: "Menghapus organisasi",
      },
    ],
  },
  {
    resource: "apiKey",
    title: "API Keys",
    description: "Penerbitan, pembatasan rate-limit, dan pencabutan API Key.",
    permissions: [
      {
        action: "read",
        label: "Read Keys",
        description: "Melihat metadata & prefix API key",
      },
      {
        action: "create",
        label: "Create Keys",
        description: "Menerbitkan API key baru",
      },
      {
        action: "update",
        label: "Toggle Keys",
        description: "Mengaktifkan/menonaktifkan API key",
      },
      {
        action: "revoke",
        label: "Revoke Keys",
        description: "Mencabut API key permanen",
      },
    ],
  },
  {
    resource: "oauthClient",
    title: "OAuth 2.1 / OIDC & MCP",
    description:
      "Registrasi aplikasi klien OAuth dan MCP authorization server.",
    permissions: [
      {
        action: "read",
        label: "Read Clients",
        description: "Melihat OAuth & MCP clients",
      },
      {
        action: "create",
        label: "Register Clients",
        description: "Mendaftarkan client ID/secret",
      },
      {
        action: "update",
        label: "Update Clients",
        description: "Mengubah redirect URI & scopes",
      },
      {
        action: "delete",
        label: "Delete Clients",
        description: "Menghapus client terdaftar",
      },
    ],
  },
  {
    resource: "sso",
    title: "Enterprise SSO & SCIM",
    description: "Konfigurasi SAML 2.0, OIDC IdP, DNS verification & SCIM.",
    permissions: [
      {
        action: "read",
        label: "Read SSO",
        description: "Melihat provider SAML/OIDC & SCIM",
      },
      {
        action: "configure",
        label: "Configure SSO",
        description: "Menambah/mengubah IdP & mapping SCIM",
      },
      {
        action: "delete",
        label: "Delete SSO",
        description: "Menghapus koneksi SSO",
      },
    ],
  },
  {
    resource: "authConfig",
    title: "Auth Core Feature Flags",
    description:
      "Aktivasi/non-aktivasi plugin dan parameter runtime Auth Core.",
    permissions: [
      {
        action: "read",
        label: "Read Config",
        description: "Melihat status plugin Auth Core",
      },
      {
        action: "configure",
        label: "Toggle & Tune",
        description: "Mengaktifkan/mematikan plugin & parameter",
      },
    ],
  },
  {
    resource: "auditLog",
    title: "Security Audit Logs",
    description: "Akses jejak audit autentikasi dan perubahan konfigurasi.",
    permissions: [
      {
        action: "read",
        label: "Read Audit Logs",
        description: "Membaca stream event audit keamanan",
      },
      {
        action: "export",
        label: "Export Logs",
        description: "Mengekspor log audit ke JSON/CSV",
      },
    ],
  },
];

export type RolePermissionMatrix = Partial<Record<RbacResource, string[]>>;

export interface RoleRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: RolePermissionMatrix;
  updatedAt: string;
}

export function countRolePermissions(
  permissions: RolePermissionMatrix,
): number {
  return Object.values(permissions).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0,
  );
}

export function getTotalAvailablePermissions(): number {
  return RBAC_RESOURCE_MODULES.reduce(
    (sum, mod) => sum + mod.permissions.length,
    0,
  );
}

export function hasPermission(
  rolePermissions: RolePermissionMatrix | undefined,
  resource: RbacResource,
  action: string,
): boolean {
  if (!rolePermissions) return false;
  return Boolean(rolePermissions[resource]?.includes(action));
}

export function generateAccessControlCode(roles: RoleRecord[]): string {
  const statementEntries = RBAC_RESOURCE_MODULES.map(
    (mod) =>
      `  ${mod.resource}: [${mod.permissions
        .map((p) => `"${p.action}"`)
        .join(", ")}],`,
  );

  const roleBlocks = roles.map((role) => {
    const perms = Object.entries(role.permissions)
      .filter(([, actions]) => actions && actions.length > 0)
      .map(
        ([res, actions]) =>
          `  ${res}: [${(actions ?? []).map((a) => `"${a}"`).join(", ")}],`,
      );
    return `export const ${role.slug.replace(/[^a-zA-Z0-9_]/g, "_")}Role = ac.newRole({\n${perms.join("\n")}\n});`;
  });

  return [
    `import { createAccessControl } from "better-auth/plugins/access";`,
    "",
    `export const statement = {`,
    ...statementEntries,
    `} as const;`,
    "",
    `export const ac = createAccessControl(statement);`,
    "",
    ...roleBlocks,
  ].join("\n");
}

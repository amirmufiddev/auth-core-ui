import { create } from "zustand";
import { type AuthUserRecord, appendAuditLog, readMockDb } from "@/api/mock-db";
import { isExternalBackendConfigured } from "@/api/client";
import { authClient } from "@/lib/auth-client";
import {
  type BetterAuthFeatureId,
  BETTER_AUTH_FEATURE_MAP,
} from "@/config/better-auth.config";
import { assertFeatureEnabled } from "@/stores/useAuthConfigStore";

const AUTH_SESSION_KEY = "authcore-active-session";

export interface PasskeyCredentialRecord {
  id: string;
  name: string;
  deviceType: string;
  createdAt: string;
}

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  organizationName?: string;
  avatarUrl?: string;
  linkedProviders: string[];
  passkeys: PasskeyCredentialRecord[];
  backupCodes: string[];
}

interface StoredAuthSnapshot {
  user: AuthSessionUser | null;
  deviceAccounts: AuthSessionUser[];
  impersonatedBy: string | null;
  lastLoginMethod: string | null;
  activeOrgId: string | null;
}

function loadSnapshot(): StoredAuthSnapshot {
  if (typeof window === "undefined") {
    return {
      user: null,
      deviceAccounts: [],
      impersonatedBy: null,
      lastLoginMethod: null,
      activeOrgId: null,
    };
  }
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) {
      return {
        user: null,
        deviceAccounts: [],
        impersonatedBy: null,
        lastLoginMethod: null,
        activeOrgId: null,
      };
    }
    return JSON.parse(raw) as StoredAuthSnapshot;
  } catch {
    return {
      user: null,
      deviceAccounts: [],
      impersonatedBy: null,
      lastLoginMethod: null,
      activeOrgId: null,
    };
  }
}

function saveSnapshot(snapshot: StoredAuthSnapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage errors
  }
}

function generateBackupCodesList(): string[] {
  return Array.from({ length: 8 }, () => {
    const a = Math.random().toString(36).slice(2, 6).toUpperCase();
    const b = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${a}-${b}`;
  });
}

function toSessionUser(record: AuthUserRecord): AuthSessionUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    username: record.username,
    role: record.role,
    emailVerified: record.emailVerified,
    twoFactorEnabled: record.twoFactorEnabled,
    organizationName: record.organizationName,
    avatarUrl: record.image,
    linkedProviders: ["google", "github"],
    passkeys:
      record.passkeyCount > 0
        ? [
            {
              id: `pk_${record.id}_1`,
              name: "MacBook Pro Touch ID",
              deviceType: "Platform Authenticator",
              createdAt: record.createdAt,
            },
          ]
        : [],
    backupCodes: record.twoFactorEnabled ? generateBackupCodesList() : [],
  };
}

interface Pending2FAState {
  email: string;
  user: AuthSessionUser;
}

interface AuthStoreState {
  user: AuthSessionUser | null;
  deviceAccounts: AuthSessionUser[];
  impersonatedBy: string | null;
  lastLoginMethod: string | null;
  activeOrgId: string | null;
  pending2FA: Pending2FAState | null;
  signInWithEmail: (input: {
    identifier: string;
    password: string;
    mode?: "email" | "username";
  }) => Promise<{ requires2FA: boolean }>;
  verifyTwoFactor: (code: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithOtp: (input: {
    channel: "email" | "phone";
    target: string;
    otp: string;
  }) => Promise<void>;
  signInWithPasskey: () => Promise<void>;
  signInWithSocial: (
    provider: string,
    featureId: BetterAuthFeatureId
  ) => Promise<void>;
  signInAnonymous: () => Promise<void>;
  signUp: (input: {
    name: string;
    email: string;
    username?: string;
    password: string;
  }) => Promise<void>;
  impersonateUser: (targetUser: AuthUserRecord) => Promise<void>;
  stopImpersonating: () => Promise<void>;
  switchDeviceAccount: (userId: string) => void;
  setActiveOrgId: (orgId: string | null) => void;
  signOut: () => Promise<void>;
  // Self-service account actions
  updateProfile: (input: {
    name?: string;
    username?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  enableTwoFactor: (
    password: string
  ) => Promise<{ totpUri: string; secret: string; backupCodes: string[] }>;
  disableTwoFactor: (password: string) => Promise<void>;
  regenerateBackupCodes: () => Promise<string[]>;
  addPasskey: (name: string) => Promise<void>;
  removePasskey: (passkeyId: string) => Promise<void>;
  linkProvider: (
    provider: string,
    featureId: BetterAuthFeatureId
  ) => Promise<void>;
  unlinkProvider: (provider: string) => Promise<void>;
  deleteOwnAccount: (confirmEmail: string) => Promise<void>;
}

const initial = loadSnapshot();

export const useAuthStore = create<AuthStoreState>((set, get) => {
  const commitUser = (
    user: AuthSessionUser | null,
    opts?: {
      impersonatedBy?: string | null;
      lastLoginMethod?: string | null;
      pending2FA?: Pending2FAState | null;
    }
  ) => {
    const currentAccounts = get().deviceAccounts;
    let nextAccounts = currentAccounts;
    if (user) {
      const exists = currentAccounts.some((acc) => acc.id === user.id);
      nextAccounts = exists
        ? currentAccounts.map((acc) => (acc.id === user.id ? user : acc))
        : [user, ...currentAccounts].slice(0, 5);
    } else if (opts?.impersonatedBy === null) {
      nextAccounts = [];
    }

    const nextSnapshot: StoredAuthSnapshot = {
      user,
      deviceAccounts: nextAccounts,
      impersonatedBy:
        opts?.impersonatedBy !== undefined
          ? opts.impersonatedBy
          : get().impersonatedBy,
      lastLoginMethod:
        opts?.lastLoginMethod !== undefined
          ? opts.lastLoginMethod
          : get().lastLoginMethod,
      activeOrgId: get().activeOrgId,
    };
    saveSnapshot(nextSnapshot);
    set({
      ...nextSnapshot,
      pending2FA:
        opts?.pending2FA !== undefined ? opts.pending2FA : get().pending2FA,
    });
  };

  return {
    user: initial.user,
    deviceAccounts: initial.deviceAccounts,
    impersonatedBy: initial.impersonatedBy,
    lastLoginMethod: initial.lastLoginMethod,
    activeOrgId: initial.activeOrgId,
    pending2FA: null,

    signInWithEmail: async ({ identifier, password, mode = "email" }) => {
      if (mode === "username") {
        assertFeatureEnabled("username");
      } else {
        assertFeatureEnabled("emailAndPassword");
      }

      if (isExternalBackendConfigured()) {
        try {
          if (mode === "email") {
            const res = await authClient.signIn.email({
              email: identifier,
              password,
            });
            if (res.data?.user) {
              const sessionUser: AuthSessionUser = {
                id: res.data.user.id,
                name: res.data.user.name,
                email: res.data.user.email,
                role: (res.data.user as { role?: string }).role ?? "user",
                emailVerified: res.data.user.emailVerified,
                twoFactorEnabled: Boolean(
                  (res.data.user as { twoFactorEnabled?: boolean })
                    .twoFactorEnabled
                ),
                linkedProviders: ["email"],
                passkeys: [],
                backupCodes: [],
              };
              commitUser(sessionUser, {
                impersonatedBy: null,
                lastLoginMethod: mode,
                pending2FA: null,
              });
              return { requires2FA: false };
            }
          }
        } catch {
          // fallback ke mock db bila server eksternal belum berjalan
        }
      }

      const db = readMockDb();
      const normalized = identifier.trim().toLowerCase();
      const found = db.users.find(
        (u) =>
          u.email.toLowerCase() === normalized ||
          (u.username ?? "").toLowerCase() === normalized
      );

      if (!found) {
        throw new Error("Kredensial tidak ditemukan.");
      }
      if (found.banned) {
        throw new Error(
          `Akun dibekukan: ${found.banReason ?? "Hubungi administrator."}`
        );
      }
      if (password.length < 4) {
        throw new Error("Kata sandi minimal 4 karakter.");
      }

      const sessionUser = toSessionUser(found);
      const is2faFeatureActive = (() => {
        try {
          assertFeatureEnabled("twoFactor");
          return true;
        } catch {
          return false;
        }
      })();

      if (
        is2faFeatureActive &&
        found.twoFactorEnabled &&
        found.email !== "admin@authcore.io"
      ) {
        set({
          pending2FA: { email: found.email, user: sessionUser },
        });
        return { requires2FA: true };
      }

      appendAuditLog({
        event: `user.signed_in.${mode}`,
        category: "auth",
        severity: "info",
        actorEmail: found.email,
        actorRole: found.role,
        target: "session/web",
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { method: mode },
      });

      commitUser(sessionUser, {
        impersonatedBy: null,
        lastLoginMethod: mode,
        pending2FA: null,
      });
      return { requires2FA: false };
    },

    verifyTwoFactor: async (code) => {
      assertFeatureEnabled("twoFactor");
      const pending = get().pending2FA;
      if (!pending) {
        throw new Error("Tidak ada tantangan 2FA yang aktif.");
      }
      if (!/^\d{6}$/.test(code) && code.trim().length < 6) {
        throw new Error("Masukkan kode 6 digit TOTP atau backup code valid.");
      }

      appendAuditLog({
        event: "two_factor.verified",
        category: "auth",
        severity: "info",
        actorEmail: pending.email,
        actorRole: pending.user.role,
        target: "totp/verify",
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { verified: true },
      });

      commitUser(pending.user, {
        impersonatedBy: null,
        lastLoginMethod: "2fa",
        pending2FA: null,
      });
    },

    signInWithMagicLink: async (email) => {
      assertFeatureEnabled("magicLink");
      const db = readMockDb();
      const found =
        db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
        db.users[0];
      appendAuditLog({
        event: "user.signed_in.magic_link",
        category: "auth",
        severity: "info",
        actorEmail: email,
        actorRole: found.role,
        target: "magic-link/verify",
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { email },
      });
      commitUser(
        {
          ...toSessionUser(found),
          email,
        },
        { impersonatedBy: null, lastLoginMethod: "magic-link", pending2FA: null }
      );
    },

    signInWithOtp: async ({ channel, target, otp }) => {
      assertFeatureEnabled(channel === "email" ? "emailOTP" : "phoneNumber");
      if (otp.trim().length < 4) {
        throw new Error("Kode OTP harus minimal 4 digit.");
      }
      const db = readMockDb();
      const found =
        db.users.find(
          (u) =>
            u.email.toLowerCase() === target.toLowerCase() ||
            u.phoneNumber === target
        ) ?? db.users[0];

      appendAuditLog({
        event: `user.signed_in.${channel}_otp`,
        category: "auth",
        severity: "info",
        actorEmail: found.email,
        actorRole: found.role,
        target: `otp/${channel}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { target },
      });

      commitUser(toSessionUser(found), {
        impersonatedBy: null,
        lastLoginMethod: `${channel}-otp`,
        pending2FA: null,
      });
    },

    signInWithPasskey: async () => {
      assertFeatureEnabled("passkey");
      const db = readMockDb();
      const found = db.users[0];
      appendAuditLog({
        event: "user.signed_in.passkey",
        category: "auth",
        severity: "info",
        actorEmail: found.email,
        actorRole: found.role,
        target: "webauthn/assertion",
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { authenticator: "platform" },
      });
      commitUser(toSessionUser(found), {
        impersonatedBy: null,
        lastLoginMethod: "passkey",
        pending2FA: null,
      });
    },

    signInWithSocial: async (provider, featureId) => {
      assertFeatureEnabled(featureId);
      const db = readMockDb();
      const found = db.users[0];
      const def = BETTER_AUTH_FEATURE_MAP[featureId];
      appendAuditLog({
        event: `user.signed_in.social_${provider}`,
        category: "auth",
        severity: "info",
        actorEmail: found.email,
        actorRole: found.role,
        target: `oauth/${provider}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { provider: def?.name ?? provider },
      });
      commitUser(toSessionUser(found), {
        impersonatedBy: null,
        lastLoginMethod: provider,
        pending2FA: null,
      });
    },

    signInAnonymous: async () => {
      assertFeatureEnabled("anonymous");
      const guest: AuthSessionUser = {
        id: `guest_${Date.now().toString(36)}`,
        name: "Guest Session",
        email: `guest-${Date.now().toString(36)}@guest.authcore.local`,
        role: "user",
        emailVerified: false,
        twoFactorEnabled: false,
        organizationName: "Guest Sandbox",
        linkedProviders: [],
        passkeys: [],
        backupCodes: [],
      };
      commitUser(guest, {
        impersonatedBy: null,
        lastLoginMethod: "anonymous",
        pending2FA: null,
      });
    },

    signUp: async ({ name, email, username }) => {
      assertFeatureEnabled("emailAndPassword");
      const created: AuthSessionUser = {
        id: `usr_${Date.now().toString(36)}`,
        name,
        email,
        username,
        role: "user",
        emailVerified: false,
        twoFactorEnabled: false,
        organizationName: "Auth Core HQ",
        linkedProviders: ["email"],
        passkeys: [],
        backupCodes: [],
      };
      appendAuditLog({
        event: "user.signed_up",
        category: "auth",
        severity: "info",
        actorEmail: email,
        actorRole: "user",
        target: `user/${email}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { method: "email" },
      });
      commitUser(created, {
        impersonatedBy: null,
        lastLoginMethod: "email",
        pending2FA: null,
      });
    },

    impersonateUser: async (targetUser) => {
      assertFeatureEnabled("admin");
      const current = get().user;
      if (!current) throw new Error("Sesi admin diperlukan.");
      appendAuditLog({
        event: "admin.impersonation_started",
        category: "admin",
        severity: "warning",
        actorEmail: current.email,
        actorRole: current.role,
        target: `user/${targetUser.email}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { targetId: targetUser.id },
      });
      commitUser(toSessionUser(targetUser), {
        impersonatedBy: current.email,
      });
    },

    stopImpersonating: async () => {
      const db = readMockDb();
      const adminEmail = get().impersonatedBy;
      const original =
        db.users.find((u) => u.email === adminEmail) ?? db.users[0];
      commitUser(toSessionUser(original), {
        impersonatedBy: null,
      });
    },

    switchDeviceAccount: (userId) => {
      assertFeatureEnabled("multiSession");
      const found = get().deviceAccounts.find((acc) => acc.id === userId);
      if (!found) return;
      commitUser(found, { impersonatedBy: null });
    },

    setActiveOrgId: (orgId) => {
      const next: StoredAuthSnapshot = {
        user: get().user,
        deviceAccounts: get().deviceAccounts,
        impersonatedBy: get().impersonatedBy,
        lastLoginMethod: get().lastLoginMethod,
        activeOrgId: orgId,
      };
      saveSnapshot(next);
      set({ activeOrgId: orgId });
    },

    signOut: async () => {
      if (isExternalBackendConfigured()) {
        try {
          await authClient.signOut();
        } catch {
          // ignore network error in local mode
        }
      }
      commitUser(null, {
        impersonatedBy: null,
        pending2FA: null,
      });
    },

    updateProfile: async (input) => {
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      if (input.username !== undefined) {
        assertFeatureEnabled("username");
      }
      const nextUser: AuthSessionUser = {
        ...current,
        name: input.name !== undefined ? input.name : current.name,
        username:
          input.username !== undefined ? input.username : current.username,
        avatarUrl:
          input.avatarUrl !== undefined ? input.avatarUrl : current.avatarUrl,
      };
      appendAuditLog({
        event: "user.profile_updated",
        category: "auth",
        severity: "info",
        actorEmail: current.email,
        actorRole: current.role,
        target: `user/${current.id}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { updatedName: nextUser.name },
      });
      commitUser(nextUser);
    },

    changeEmail: async (newEmail) => {
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      const nextUser: AuthSessionUser = {
        ...current,
        email: newEmail,
        emailVerified: false,
      };
      appendAuditLog({
        event: "user.email_changed",
        category: "auth",
        severity: "warning",
        actorEmail: current.email,
        actorRole: current.role,
        target: `user/${newEmail}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { previousEmail: current.email },
      });
      commitUser(nextUser);
    },

    changePassword: async ({ currentPassword, newPassword }) => {
      assertFeatureEnabled("emailAndPassword");
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      if (currentPassword.length < 4) {
        throw new Error("Kata sandi saat ini tidak valid.");
      }
      if (newPassword.length < 8) {
        throw new Error("Kata sandi baru minimal 8 karakter.");
      }
      appendAuditLog({
        event: "user.password_changed",
        category: "auth",
        severity: "warning",
        actorEmail: current.email,
        actorRole: current.role,
        target: `user/${current.id}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { changed: true },
      });
    },

    enableTwoFactor: async (password) => {
      assertFeatureEnabled("twoFactor");
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      if (password.length < 4) {
        throw new Error("Masukkan kata sandi Anda untuk mengaktifkan 2FA.");
      }
      const secret = "JBSWY3DPEHPK3PXP";
      const totpUri = `otpauth://totp/Auth Core:${encodeURIComponent(current.email)}?secret=${secret}&issuer=Auth Core`;
      const backupCodes = generateBackupCodesList();
      const nextUser: AuthSessionUser = {
        ...current,
        twoFactorEnabled: true,
        backupCodes,
      };
      appendAuditLog({
        event: "two_factor.enabled",
        category: "auth",
        severity: "warning",
        actorEmail: current.email,
        actorRole: current.role,
        target: `user/${current.id}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { issuer: "Auth Core" },
      });
      commitUser(nextUser);
      return { totpUri, secret, backupCodes };
    },

    disableTwoFactor: async (password) => {
      assertFeatureEnabled("twoFactor");
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      if (password.length < 4) {
        throw new Error("Masukkan kata sandi Anda untuk menonaktifkan 2FA.");
      }
      const nextUser: AuthSessionUser = {
        ...current,
        twoFactorEnabled: false,
        backupCodes: [],
      };
      appendAuditLog({
        event: "two_factor.disabled",
        category: "auth",
        severity: "critical",
        actorEmail: current.email,
        actorRole: current.role,
        target: `user/${current.id}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { disabled: true },
      });
      commitUser(nextUser);
    },

    regenerateBackupCodes: async () => {
      assertFeatureEnabled("twoFactor");
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      const backupCodes = generateBackupCodesList();
      commitUser({ ...current, backupCodes });
      return backupCodes;
    },

    addPasskey: async (name) => {
      assertFeatureEnabled("passkey");
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      const created: PasskeyCredentialRecord = {
        id: `pk_${Date.now().toString(36)}`,
        name: name.trim() || "Hardware Passkey",
        deviceType: "WebAuthn Credential",
        createdAt: new Date().toISOString(),
      };
      const existing = current.passkeys ?? [];
      appendAuditLog({
        event: "passkey.registered",
        category: "auth",
        severity: "info",
        actorEmail: current.email,
        actorRole: current.role,
        target: `passkey/${created.name}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { passkeyId: created.id },
      });
      commitUser({ ...current, passkeys: [created, ...existing] });
    },

    removePasskey: async (passkeyId) => {
      assertFeatureEnabled("passkey");
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      const existing = current.passkeys ?? [];
      commitUser({
        ...current,
        passkeys: existing.filter((p) => p.id !== passkeyId),
      });
    },

    linkProvider: async (provider, featureId) => {
      assertFeatureEnabled("accountLinking");
      assertFeatureEnabled(featureId);
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      const existing = current.linkedProviders ?? [];
      if (existing.includes(provider)) return;
      appendAuditLog({
        event: "account.provider_linked",
        category: "auth",
        severity: "info",
        actorEmail: current.email,
        actorRole: current.role,
        target: `oauth/${provider}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { provider },
      });
      commitUser({
        ...current,
        linkedProviders: [...existing, provider],
      });
    },

    unlinkProvider: async (provider) => {
      assertFeatureEnabled("accountLinking");
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      const existing = current.linkedProviders ?? [];
      if (existing.length <= 1) {
        throw new Error("Minimal 1 metode autentikasi harus tetap terhubung.");
      }
      commitUser({
        ...current,
        linkedProviders: existing.filter((p) => p !== provider),
      });
    },

    deleteOwnAccount: async (confirmEmail) => {
      const current = get().user;
      if (!current) throw new Error("Sesi login diperlukan.");
      if (confirmEmail.trim().toLowerCase() !== current.email.toLowerCase()) {
        throw new Error("Email konfirmasi tidak cocok.");
      }
      appendAuditLog({
        event: "user.account_deleted",
        category: "auth",
        severity: "critical",
        actorEmail: current.email,
        actorRole: current.role,
        target: `user/${current.id}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        metadata: { selfDelete: true },
      });
      commitUser(null, { impersonatedBy: null, pending2FA: null });
    },
  };
});

export type BetterAuthFeatureCategory =
  | "core"
  | "authentication"
  | "social"
  | "authorization"
  | "enterprise"
  | "utility"
  | "payments";

export type BetterAuthFeatureId =
  // Core
  | "emailAndPassword"
  | "emailVerification"
  | "accountLinking"
  | "sessionManagement"
  | "rateLimit"
  // Authentication
  | "twoFactor"
  | "passkey"
  | "magicLink"
  | "emailOTP"
  | "username"
  | "phoneNumber"
  | "anonymous"
  | "oneTap"
  | "siwe"
  | "genericOAuth"
  // Social OAuth
  | "socialGoogle"
  | "socialGithub"
  | "socialMicrosoft"
  | "socialApple"
  | "socialDiscord"
  | "socialGitlab"
  | "socialSlack"
  | "socialLinkedin"
  | "socialTwitter"
  | "socialFigma"
  | "socialNotion"
  | "socialLinear"
  | "socialVercel"
  // Authorization & Multi-tenant
  | "admin"
  | "organization"
  | "apiKey"
  | "agentAuth"
  // OAuth 2.1 / OIDC & Enterprise
  | "oauthProvider"
  | "mcp"
  | "deviceAuthorization"
  | "sso"
  | "scim"
  // Security & Utility
  | "bearer"
  | "jwt"
  | "multiSession"
  | "captcha"
  | "haveIBeenPwned"
  | "lastLoginMethod"
  | "oneTimeToken"
  | "oauthProxy"
  | "openAPI"
  | "i18n"
  | "auditLogs"
  // Payments & Billing
  | "stripe"
  | "polar"
  | "autumn"
  | "dodoPayments"
  | "creem"
  | "chargebee";

export type FeatureSettingFieldType = "text" | "number" | "boolean" | "select";

export interface FeatureSettingField {
  key: string;
  label: string;
  type: FeatureSettingFieldType;
  description?: string;
  options?: string[];
  placeholder?: string;
}

export interface BetterAuthFeatureDefinition {
  id: BetterAuthFeatureId;
  name: string;
  category: BetterAuthFeatureCategory;
  packageName: string;
  pluginKey: string;
  clientPluginKey?: string;
  description: string;
  defaultEnabled: boolean;
  dependencies?: BetterAuthFeatureId[];
  endpoints: string[];
  settingsSchema: FeatureSettingField[];
  defaultSettings: Record<string, string | number | boolean>;
}

export const FEATURE_CATEGORY_META: Record<
  BetterAuthFeatureCategory,
  { label: string; description: string }
> = {
  core: {
    label: "Core & Session",
    description:
      "Autentikasi dasar, sesi, verifikasi email, dan rate limiting.",
  },
  authentication: {
    label: "Auth Methods",
    description: "2FA, Passkey WebAuthn, Magic Link, OTP, Username, dan Web3.",
  },
  social: {
    label: "Social OAuth",
    description: "Provider OAuth sosial bawaan Auth Core.",
  },
  authorization: {
    label: "RBAC & Tenant",
    description: "Admin plugin, Organisasi/Tim, API Key, dan Agent Auth.",
  },
  enterprise: {
    label: "OIDC & Enterprise",
    description:
      "OAuth 2.1 Provider, MCP, SAML/OIDC SSO, dan SCIM provisioning.",
  },
  utility: {
    label: "Security & Utility",
    description:
      "JWT, Bearer token, Captcha, HIBP, Multi-session, dan Audit Logs.",
  },
  payments: {
    label: "Payments",
    description: "Integrasi billing & langganan yang terhubung ke sesi user.",
  },
};

function readEnvBool(key: string, fallback: boolean): boolean {
  const env = import.meta.env as Record<string, string | undefined>;
  const raw = env[key];
  if (raw === undefined || raw === "") return fallback;
  return raw.toLowerCase() === "true";
}

export const BETTER_AUTH_FEATURES: BetterAuthFeatureDefinition[] = [
  // CORE
  {
    id: "emailAndPassword",
    name: "Email & Password",
    category: "core",
    packageName: "better-auth",
    pluginKey: "emailAndPassword",
    description:
      "Autentikasi standar menggunakan email dan kata sandi ter-hash scrypt.",
    defaultEnabled: readEnvBool("VITE_FEATURE_EMAIL_PASSWORD", true),
    endpoints: ["/api/auth/sign-in/email", "/api/auth/sign-up/email"],
    settingsSchema: [
      {
        key: "minPasswordLength",
        label: "Min Password Length",
        type: "number",
      },
      {
        key: "maxPasswordLength",
        label: "Max Password Length",
        type: "number",
      },
      {
        key: "autoSignIn",
        label: "Auto Sign-In After Sign-Up",
        type: "boolean",
      },
      {
        key: "requireEmailVerification",
        label: "Require Email Verification",
        type: "boolean",
      },
    ],
    defaultSettings: {
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
      requireEmailVerification: false,
    },
  },
  {
    id: "emailVerification",
    name: "Email Verification",
    category: "core",
    packageName: "better-auth",
    pluginKey: "emailVerification",
    description:
      "Verifikasi kepemilikan email dengan token bertanda tangan & callback URL.",
    defaultEnabled: readEnvBool("VITE_FEATURE_EMAIL_VERIFICATION", true),
    endpoints: ["/api/auth/send-verification-email", "/api/auth/verify-email"],
    settingsSchema: [
      { key: "sendOnSignUp", label: "Send On Sign-Up", type: "boolean" },
      {
        key: "autoSignInAfterVerification",
        label: "Auto Sign-In After Verification",
        type: "boolean",
      },
      { key: "expiresIn", label: "Token TTL (detik)", type: "number" },
    ],
    defaultSettings: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 3600,
    },
  },
  {
    id: "accountLinking",
    name: "Account Linking",
    category: "core",
    packageName: "better-auth",
    pluginKey: "account.accountLinking",
    description:
      "Menghubungkan beberapa provider OAuth atau kredensial ke satu akun user.",
    defaultEnabled: true,
    endpoints: ["/api/auth/link-social", "/api/auth/unlink-account"],
    settingsSchema: [
      { key: "enabled", label: "Allow Account Linking", type: "boolean" },
      {
        key: "allowDifferentEmails",
        label: "Allow Different Emails",
        type: "boolean",
      },
      {
        key: "trustedProviders",
        label: "Trusted Providers (comma)",
        type: "text",
      },
    ],
    defaultSettings: {
      enabled: true,
      allowDifferentEmails: false,
      trustedProviders: "google,github",
    },
  },
  {
    id: "sessionManagement",
    name: "Session Management",
    category: "core",
    packageName: "better-auth",
    pluginKey: "session",
    description:
      "Konfigurasi masa berlaku sesi, updateAge, dan cookie cache stateless.",
    defaultEnabled: true,
    endpoints: [
      "/api/auth/get-session",
      "/api/auth/list-sessions",
      "/api/auth/revoke-session",
    ],
    settingsSchema: [
      { key: "expiresIn", label: "Session Expires In (detik)", type: "number" },
      { key: "updateAge", label: "Refresh Window (detik)", type: "number" },
      {
        key: "cookieCacheEnabled",
        label: "Enable Cookie Cache",
        type: "boolean",
      },
      {
        key: "cookieCacheMaxAge",
        label: "Cookie Cache Max Age (detik)",
        type: "number",
      },
    ],
    defaultSettings: {
      expiresIn: 604800,
      updateAge: 86400,
      cookieCacheEnabled: true,
      cookieCacheMaxAge: 300,
    },
  },
  {
    id: "rateLimit",
    name: "Rate Limiting",
    category: "core",
    packageName: "better-auth",
    pluginKey: "rateLimit",
    description: "Proteksi brute-force per IP dan endpoint autentikasi.",
    defaultEnabled: true,
    endpoints: ["Global Middleware"],
    settingsSchema: [
      { key: "window", label: "Window (detik)", type: "number" },
      { key: "max", label: "Max Requests / Window", type: "number" },
      {
        key: "storage",
        label: "Storage Backend",
        type: "select",
        options: ["memory", "database", "secondary-storage"],
      },
    ],
    defaultSettings: {
      window: 60,
      max: 100,
      storage: "secondary-storage",
    },
  },

  // AUTHENTICATION PLUGINS
  {
    id: "twoFactor",
    name: "Two-Factor Auth (2FA)",
    category: "authentication",
    packageName: "better-auth/plugins",
    pluginKey: "twoFactor",
    clientPluginKey: "twoFactorClient",
    description:
      "Autentikasi 2 langkah dengan TOTP Authenticator, OTP email/SMS, dan backup codes.",
    defaultEnabled: readEnvBool("VITE_FEATURE_TWO_FACTOR", true),
    endpoints: [
      "/api/auth/two-factor/enable",
      "/api/auth/two-factor/verify-totp",
      "/api/auth/two-factor/verify-backup-code",
    ],
    settingsSchema: [
      { key: "issuer", label: "TOTP Issuer Name", type: "text" },
      {
        key: "totpDigits",
        label: "TOTP Digits",
        type: "select",
        options: ["6", "8"],
      },
      { key: "backupCodeAmount", label: "Backup Code Amount", type: "number" },
    ],
    defaultSettings: {
      issuer: "Auth Core",
      totpDigits: "6",
      backupCodeAmount: 10,
    },
  },
  {
    id: "passkey",
    name: "Passkey (WebAuthn)",
    category: "authentication",
    packageName: "@better-auth/passkey",
    pluginKey: "passkey",
    clientPluginKey: "passkeyClient",
    description:
      "Login biometrik & hardware key passwordless berbasis FIDO2/WebAuthn.",
    defaultEnabled: readEnvBool("VITE_FEATURE_PASSKEY", true),
    endpoints: [
      "/api/auth/passkey/generate-register-options",
      "/api/auth/passkey/verify-authentication",
    ],
    settingsSchema: [
      { key: "rpID", label: "Relying Party ID", type: "text" },
      { key: "rpName", label: "Relying Party Name", type: "text" },
      {
        key: "authenticatorAttachment",
        label: "Attachment",
        type: "select",
        options: ["platform", "cross-platform", "any"],
      },
    ],
    defaultSettings: {
      rpID: "localhost",
      rpName: "Auth Core Identity",
      authenticatorAttachment: "any",
    },
  },
  {
    id: "magicLink",
    name: "Magic Link",
    category: "authentication",
    packageName: "better-auth/plugins",
    pluginKey: "magicLink",
    clientPluginKey: "magicLinkClient",
    description:
      "Login satu klik lewat tautan sekali pakai yang dikirim ke email.",
    defaultEnabled: readEnvBool("VITE_FEATURE_MAGIC_LINK", true),
    endpoints: ["/api/auth/sign-in/magic-link", "/api/auth/magic-link/verify"],
    settingsSchema: [
      { key: "expiresIn", label: "Link TTL (detik)", type: "number" },
      { key: "disableSignUp", label: "Disable Auto Sign-Up", type: "boolean" },
    ],
    defaultSettings: {
      expiresIn: 300,
      disableSignUp: false,
    },
  },
  {
    id: "emailOTP",
    name: "Email OTP",
    category: "authentication",
    packageName: "better-auth/plugins",
    pluginKey: "emailOTP",
    clientPluginKey: "emailOTPClient",
    description:
      "Kode OTP 6 digit lewat email untuk login, verifikasi, dan reset password.",
    defaultEnabled: readEnvBool("VITE_FEATURE_EMAIL_OTP", true),
    endpoints: [
      "/api/auth/email-otp/send-verification-otp",
      "/api/auth/sign-in/email-otp",
    ],
    settingsSchema: [
      { key: "otpLength", label: "OTP Length", type: "number" },
      { key: "expiresIn", label: "Expires In (detik)", type: "number" },
      { key: "allowedAttempts", label: "Max Attempts", type: "number" },
    ],
    defaultSettings: {
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
    },
  },
  {
    id: "username",
    name: "Username Auth",
    category: "authentication",
    packageName: "better-auth/plugins",
    pluginKey: "username",
    clientPluginKey: "usernameClient",
    description: "Dukungan sign-in dan registrasi menggunakan username unik.",
    defaultEnabled: readEnvBool("VITE_FEATURE_USERNAME", true),
    endpoints: [
      "/api/auth/sign-in/username",
      "/api/auth/is-username-available",
    ],
    settingsSchema: [
      {
        key: "minUsernameLength",
        label: "Min Username Length",
        type: "number",
      },
      {
        key: "maxUsernameLength",
        label: "Max Username Length",
        type: "number",
      },
    ],
    defaultSettings: {
      minUsernameLength: 3,
      maxUsernameLength: 30,
    },
  },
  {
    id: "phoneNumber",
    name: "Phone Number & SMS OTP",
    category: "authentication",
    packageName: "better-auth/plugins",
    pluginKey: "phoneNumber",
    clientPluginKey: "phoneNumberClient",
    description:
      "Login dan verifikasi akun menggunakan nomor telepon + SMS OTP.",
    defaultEnabled: readEnvBool("VITE_FEATURE_PHONE_NUMBER", false),
    endpoints: [
      "/api/auth/phone-number/send-otp",
      "/api/auth/sign-in/phone-number",
    ],
    settingsSchema: [
      { key: "otpLength", label: "OTP Length", type: "number" },
      { key: "expiresIn", label: "Expires In (detik)", type: "number" },
      {
        key: "requireVerification",
        label: "Require Verification",
        type: "boolean",
      },
    ],
    defaultSettings: {
      otpLength: 6,
      expiresIn: 300,
      requireVerification: true,
    },
  },
  {
    id: "anonymous",
    name: "Anonymous Guest Auth",
    category: "authentication",
    packageName: "better-auth/plugins",
    pluginKey: "anonymous",
    clientPluginKey: "anonymousClient",
    description:
      "Membuat sesi tamu sementara yang dapat di-upgrade menjadi akun permanen.",
    defaultEnabled: readEnvBool("VITE_FEATURE_ANONYMOUS", false),
    endpoints: ["/api/auth/sign-in/anonymous"],
    settingsSchema: [
      { key: "emailDomainName", label: "Synthetic Email Domain", type: "text" },
      {
        key: "disableDeleteAnonymousUser",
        label: "Keep Guest Record On Link",
        type: "boolean",
      },
    ],
    defaultSettings: {
      emailDomainName: "guest.authcore.local",
      disableDeleteAnonymousUser: false,
    },
  },
  {
    id: "oneTap",
    name: "Google One Tap",
    category: "authentication",
    packageName: "better-auth/plugins",
    pluginKey: "oneTap",
    clientPluginKey: "oneTapClient",
    description: "Prompt sign-in instan Google One Tap di halaman login.",
    defaultEnabled: false,
    dependencies: ["socialGoogle"],
    endpoints: ["/api/auth/one-tap/callback"],
    settingsSchema: [
      { key: "clientId", label: "Google Client ID", type: "text" },
      { key: "disableSignup", label: "Disable Auto Sign-Up", type: "boolean" },
    ],
    defaultSettings: {
      clientId: "",
      disableSignup: false,
    },
  },
  {
    id: "siwe",
    name: "Sign In With Ethereum (SIWE)",
    category: "authentication",
    packageName: "better-auth/plugins",
    pluginKey: "siwe",
    clientPluginKey: "siweClient",
    description:
      "Autentikasi wallet Web3 berbasis EIP-4361 SIWE nonce & signature.",
    defaultEnabled: false,
    endpoints: ["/api/auth/siwe/nonce", "/api/auth/siwe/verify"],
    settingsSchema: [
      { key: "domain", label: "SIWE Domain", type: "text" },
      {
        key: "anonymous",
        label: "Allow Wallet Without Email",
        type: "boolean",
      },
    ],
    defaultSettings: {
      domain: "authcore.local",
      anonymous: true,
    },
  },
  {
    id: "genericOAuth",
    name: "Generic OAuth / OIDC",
    category: "authentication",
    packageName: "better-auth/plugins",
    pluginKey: "genericOAuth",
    clientPluginKey: "genericOAuthClient",
    description:
      "Konektor OAuth 2.0 / OIDC kustom (Keycloak, Authentik, Okta, Ory, dll.).",
    defaultEnabled: false,
    endpoints: [
      "/api/auth/sign-in/oauth2",
      "/api/auth/oauth2/callback/:providerId",
    ],
    settingsSchema: [
      { key: "providerId", label: "Provider ID", type: "text" },
      { key: "discoveryUrl", label: "OIDC Discovery URL", type: "text" },
      { key: "clientId", label: "Client ID", type: "text" },
    ],
    defaultSettings: {
      providerId: "keycloak",
      discoveryUrl: "",
      clientId: "",
    },
  },

  // SOCIAL PROVIDERS
  {
    id: "socialGoogle",
    name: "Google OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.google",
    description: "Social Sign-On menggunakan Google Identity OAuth 2.0.",
    defaultEnabled: readEnvBool("VITE_FEATURE_SOCIAL_GOOGLE", true),
    endpoints: ["/api/auth/sign-in/social", "/api/auth/callback/google"],
    settingsSchema: [
      { key: "clientId", label: "Client ID", type: "text" },
      {
        key: "prompt",
        label: "Consent Prompt",
        type: "select",
        options: ["select_account", "consent", "none"],
      },
    ],
    defaultSettings: {
      clientId: "google-oauth-client-id",
      prompt: "select_account",
    },
  },
  {
    id: "socialGithub",
    name: "GitHub OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.github",
    description: "Social Sign-On menggunakan GitHub OAuth Apps.",
    defaultEnabled: readEnvBool("VITE_FEATURE_SOCIAL_GITHUB", true),
    endpoints: ["/api/auth/sign-in/social", "/api/auth/callback/github"],
    settingsSchema: [
      { key: "clientId", label: "Client ID", type: "text" },
      { key: "scope", label: "Scopes", type: "text" },
    ],
    defaultSettings: {
      clientId: "github-oauth-client-id",
      scope: "read:user user:email",
    },
  },
  {
    id: "socialMicrosoft",
    name: "Microsoft Entra ID",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.microsoft",
    description:
      "Sign-in dengan akun Microsoft Personal atau Azure AD / Entra ID.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/microsoft"],
    settingsSchema: [
      { key: "clientId", label: "Application (Client) ID", type: "text" },
      { key: "tenantId", label: "Tenant ID", type: "text" },
    ],
    defaultSettings: { clientId: "", tenantId: "common" },
  },
  {
    id: "socialApple",
    name: "Apple Sign In",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.apple",
    description: "Sign in with Apple untuk web & aplikasi iOS/macOS.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/apple"],
    settingsSchema: [{ key: "clientId", label: "Service ID", type: "text" }],
    defaultSettings: { clientId: "" },
  },
  {
    id: "socialDiscord",
    name: "Discord OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.discord",
    description: "Autentikasi komunitas dengan Discord OAuth2.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/discord"],
    settingsSchema: [{ key: "clientId", label: "Client ID", type: "text" }],
    defaultSettings: { clientId: "" },
  },
  {
    id: "socialGitlab",
    name: "GitLab OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.gitlab",
    description: "Sign-in menggunakan GitLab SaaS atau Self-Managed.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/gitlab"],
    settingsSchema: [
      { key: "clientId", label: "Application ID", type: "text" },
    ],
    defaultSettings: { clientId: "" },
  },
  {
    id: "socialSlack",
    name: "Slack OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.slack",
    description: "Sign in with Slack untuk workspace tim.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/slack"],
    settingsSchema: [{ key: "clientId", label: "Client ID", type: "text" }],
    defaultSettings: { clientId: "" },
  },
  {
    id: "socialLinkedin",
    name: "LinkedIn OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.linkedin",
    description: "Sign in with LinkedIn OpenID Connect.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/linkedin"],
    settingsSchema: [{ key: "clientId", label: "Client ID", type: "text" }],
    defaultSettings: { clientId: "" },
  },
  {
    id: "socialTwitter",
    name: "X (Twitter) OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.twitter",
    description: "OAuth 2.0 PKCE dengan akun X / Twitter.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/twitter"],
    settingsSchema: [{ key: "clientId", label: "Client ID", type: "text" }],
    defaultSettings: { clientId: "" },
  },
  {
    id: "socialFigma",
    name: "Figma OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.figma",
    description: "Sign-in dengan akun Figma.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/figma"],
    settingsSchema: [{ key: "clientId", label: "Client ID", type: "text" }],
    defaultSettings: { clientId: "" },
  },
  {
    id: "socialNotion",
    name: "Notion OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.notion",
    description: "Sign-in dengan akun Notion workspace.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/notion"],
    settingsSchema: [
      { key: "clientId", label: "OAuth Client ID", type: "text" },
    ],
    defaultSettings: { clientId: "" },
  },
  {
    id: "socialLinear",
    name: "Linear OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.linear",
    description: "Sign-in dengan akun Linear.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/linear"],
    settingsSchema: [{ key: "clientId", label: "Client ID", type: "text" }],
    defaultSettings: { clientId: "" },
  },
  {
    id: "socialVercel",
    name: "Vercel OAuth",
    category: "social",
    packageName: "better-auth",
    pluginKey: "socialProviders.vercel",
    description: "Sign in with Vercel.",
    defaultEnabled: false,
    endpoints: ["/api/auth/callback/vercel"],
    settingsSchema: [{ key: "clientId", label: "Client ID", type: "text" }],
    defaultSettings: { clientId: "" },
  },

  // AUTHORIZATION & MULTI-TENANT
  {
    id: "admin",
    name: "Admin & RBAC",
    category: "authorization",
    packageName: "better-auth/plugins",
    pluginKey: "admin",
    clientPluginKey: "adminClient",
    description:
      "Manajemen user, role, custom access control, ban/unban, dan impersonation.",
    defaultEnabled: readEnvBool("VITE_FEATURE_ADMIN", true),
    endpoints: [
      "/api/auth/admin/list-users",
      "/api/auth/admin/set-role",
      "/api/auth/admin/ban-user",
      "/api/auth/admin/impersonate-user",
    ],
    settingsSchema: [
      { key: "defaultRole", label: "Default User Role", type: "text" },
      { key: "adminRoles", label: "Admin Roles (comma)", type: "text" },
      {
        key: "impersonationSessionDuration",
        label: "Impersonation TTL (detik)",
        type: "number",
      },
    ],
    defaultSettings: {
      defaultRole: "user",
      adminRoles: "super_admin,admin",
      impersonationSessionDuration: 3600,
    },
  },
  {
    id: "organization",
    name: "Organizations & Teams",
    category: "authorization",
    packageName: "better-auth/plugins",
    pluginKey: "organization",
    clientPluginKey: "organizationClient",
    description:
      "Multi-tenant organisasi, role per org, teams, dan undangan member.",
    defaultEnabled: readEnvBool("VITE_FEATURE_ORGANIZATION", true),
    endpoints: [
      "/api/auth/organization/create",
      "/api/auth/organization/invite-member",
      "/api/auth/organization/set-active",
    ],
    settingsSchema: [
      {
        key: "allowUserToCreateOrganization",
        label: "Allow Users Create Org",
        type: "boolean",
      },
      { key: "organizationLimit", label: "Max Org / User", type: "number" },
      { key: "teamsEnabled", label: "Enable Sub-Teams", type: "boolean" },
      {
        key: "invitationExpiresIn",
        label: "Invitation TTL (detik)",
        type: "number",
      },
    ],
    defaultSettings: {
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      teamsEnabled: true,
      invitationExpiresIn: 172800,
    },
  },
  {
    id: "apiKey",
    name: "API Keys",
    category: "authorization",
    packageName: "@better-auth/api-key",
    pluginKey: "apiKey",
    clientPluginKey: "apiKeyClient",
    description:
      "Penerbitan API key ter-hash dengan prefix, scoped permissions, & rate limit.",
    defaultEnabled: readEnvBool("VITE_FEATURE_API_KEY", true),
    endpoints: [
      "/api/auth/api-key/create",
      "/api/auth/api-key/verify",
      "/api/auth/api-key/list",
    ],
    settingsSchema: [
      { key: "defaultPrefix", label: "Key Prefix", type: "text" },
      { key: "defaultKeyLength", label: "Random Key Length", type: "number" },
      {
        key: "enableMetadata",
        label: "Enable Custom Metadata",
        type: "boolean",
      },
      {
        key: "rateLimitEnabled",
        label: "Enable Per-Key Rate Limit",
        type: "boolean",
      },
    ],
    defaultSettings: {
      defaultPrefix: "ak_live_",
      defaultKeyLength: 48,
      enableMetadata: true,
      rateLimitEnabled: true,
    },
  },
  {
    id: "agentAuth",
    name: "Agent Auth",
    category: "authorization",
    packageName: "better-auth/plugins",
    pluginKey: "agentAuth",
    description:
      "Identitas, discovery, dan otorisasi berbasis kapabilitas untuk AI agents.",
    defaultEnabled: false,
    endpoints: ["/api/auth/agent/register", "/api/auth/agent/authorize"],
    settingsSchema: [
      {
        key: "requireApproval",
        label: "Require Human Approval",
        type: "boolean",
      },
      { key: "tokenTTL", label: "Agent Token TTL (detik)", type: "number" },
    ],
    defaultSettings: {
      requireApproval: true,
      tokenTTL: 1800,
    },
  },

  // OAUTH 2.1 / OIDC & ENTERPRISE
  {
    id: "oauthProvider",
    name: "OAuth 2.1 & OIDC Provider",
    category: "enterprise",
    packageName: "@better-auth/oauth-provider",
    pluginKey: "oauthProvider",
    clientPluginKey: "oauthProviderClient",
    description:
      "Jadikan Auth Core sebagai OAuth 2.1 / OpenID Connect IdP bagi aplikasi klien eksternal.",
    defaultEnabled: readEnvBool("VITE_FEATURE_OAUTH_PROVIDER", true),
    endpoints: [
      "/api/auth/oauth2/authorize",
      "/api/auth/oauth2/token",
      "/.well-known/openid-configuration",
    ],
    settingsSchema: [
      {
        key: "accessTokenExpiresIn",
        label: "Access Token TTL (detik)",
        type: "number",
      },
      {
        key: "refreshTokenExpiresIn",
        label: "Refresh Token TTL (detik)",
        type: "number",
      },
      {
        key: "allowDynamicClientRegistration",
        label: "Allow Dynamic Registration",
        type: "boolean",
      },
    ],
    defaultSettings: {
      accessTokenExpiresIn: 3600,
      refreshTokenExpiresIn: 2592000,
      allowDynamicClientRegistration: false,
    },
  },
  {
    id: "mcp",
    name: "MCP OAuth Provider",
    category: "enterprise",
    packageName: "better-auth/plugins",
    pluginKey: "mcp",
    description:
      "OAuth authorization server standar untuk Model Context Protocol (MCP) clients.",
    defaultEnabled: readEnvBool("VITE_FEATURE_MCP", true),
    dependencies: ["oauthProvider"],
    endpoints: [
      "/api/auth/mcp/authorize",
      "/.well-known/oauth-authorization-server",
    ],
    settingsSchema: [
      { key: "loginPage", label: "Login Redirect Path", type: "text" },
      { key: "resource", label: "MCP Resource URI", type: "text" },
    ],
    defaultSettings: {
      loginPage: "/login",
      resource: "https://api.authcore.local/mcp",
    },
  },
  {
    id: "deviceAuthorization",
    name: "Device Authorization Grant",
    category: "enterprise",
    packageName: "better-auth/plugins",
    pluginKey: "deviceAuthorization",
    clientPluginKey: "deviceAuthorizationClient",
    description:
      "Alur RFC 8628 untuk CLI, Smart TV, dan perangkat tanpa browser penuh.",
    defaultEnabled: false,
    endpoints: ["/api/auth/device/code", "/api/auth/device/token"],
    settingsSchema: [
      { key: "expiresIn", label: "Device Code TTL (detik)", type: "number" },
      { key: "interval", label: "Polling Interval (detik)", type: "number" },
    ],
    defaultSettings: {
      expiresIn: 600,
      interval: 5,
    },
  },
  {
    id: "sso",
    name: "Enterprise SSO (SAML & OIDC)",
    category: "enterprise",
    packageName: "@better-auth/sso",
    pluginKey: "sso",
    clientPluginKey: "ssoClient",
    description:
      "Konektor SAML 2.0 & OIDC per organisasi beserta verifikasi domain DNS TXT.",
    defaultEnabled: readEnvBool("VITE_FEATURE_SSO", true),
    dependencies: ["organization"],
    endpoints: [
      "/api/auth/sso/register",
      "/api/auth/sso/saml2/callback/:providerId",
    ],
    settingsSchema: [
      {
        key: "domainVerification",
        label: "Enforce DNS TXT Verification",
        type: "boolean",
      },
      { key: "provisionUser", label: "JIT User Provisioning", type: "boolean" },
    ],
    defaultSettings: {
      domainVerification: true,
      provisionUser: true,
    },
  },
  {
    id: "scim",
    name: "SCIM 2.0 Provisioning",
    category: "enterprise",
    packageName: "@better-auth/scim",
    pluginKey: "scim",
    description:
      "Sinkronisasi otomatis user & grup dari Okta, Entra ID, dan Google Workspace.",
    defaultEnabled: readEnvBool("VITE_FEATURE_SCIM", false),
    dependencies: ["organization", "sso"],
    endpoints: ["/api/auth/scim/v2/Users", "/api/auth/scim/v2/Groups"],
    settingsSchema: [
      {
        key: "storeSCIMToken",
        label: "Token Hash Mode",
        type: "select",
        options: ["hashed", "encrypted"],
      },
    ],
    defaultSettings: {
      storeSCIMToken: "hashed",
    },
  },

  // SECURITY & UTILITY
  {
    id: "bearer",
    name: "Bearer Token Auth",
    category: "utility",
    packageName: "better-auth/plugins",
    pluginKey: "bearer",
    description:
      "Mengizinkan autentikasi API menggunakan Authorization: Bearer <token>.",
    defaultEnabled: readEnvBool("VITE_FEATURE_BEARER", true),
    endpoints: ["Header Authorization: Bearer"],
    settingsSchema: [
      {
        key: "requireSignature",
        label: "Require Signed Token",
        type: "boolean",
      },
    ],
    defaultSettings: {
      requireSignature: true,
    },
  },
  {
    id: "jwt",
    name: "JWT & JWKS",
    category: "utility",
    packageName: "better-auth/plugins",
    pluginKey: "jwt",
    clientPluginKey: "jwtClient",
    description:
      "Menerbitkan JWT bertanda tangan & endpoint publik JWKS untuk verifikasi stateless.",
    defaultEnabled: readEnvBool("VITE_FEATURE_JWT", true),
    endpoints: ["/api/auth/token", "/api/auth/jwks"],
    settingsSchema: [
      { key: "expirationTime", label: "JWT Expiration", type: "text" },
      {
        key: "algorithm",
        label: "Signing Algorithm",
        type: "select",
        options: ["EdDSA", "RS256", "ES256"],
      },
    ],
    defaultSettings: {
      expirationTime: "15m",
      algorithm: "EdDSA",
    },
  },
  {
    id: "multiSession",
    name: "Multi-Session Switcher",
    category: "utility",
    packageName: "better-auth/plugins",
    pluginKey: "multiSession",
    clientPluginKey: "multiSessionClient",
    description:
      "Berpindah antar beberapa akun aktif sekaligus dalam satu browser.",
    defaultEnabled: readEnvBool("VITE_FEATURE_MULTI_SESSION", true),
    endpoints: [
      "/api/auth/multi-session/list-device-sessions",
      "/api/auth/multi-session/set-active",
    ],
    settingsSchema: [
      {
        key: "maximumSessions",
        label: "Max Sessions / Browser",
        type: "number",
      },
    ],
    defaultSettings: {
      maximumSessions: 5,
    },
  },
  {
    id: "captcha",
    name: "Captcha Protection",
    category: "utility",
    packageName: "better-auth/plugins",
    pluginKey: "captcha",
    description:
      "Proteksi Turnstile, reCAPTCHA, atau hCaptcha pada endpoint sign-in & sign-up.",
    defaultEnabled: false,
    endpoints: ["/api/auth/sign-in/*", "/api/auth/sign-up/*"],
    settingsSchema: [
      {
        key: "provider",
        label: "Captcha Provider",
        type: "select",
        options: ["cloudflare-turnstile", "google-recaptcha", "hcaptcha"],
      },
      { key: "siteKey", label: "Site Key", type: "text" },
    ],
    defaultSettings: {
      provider: "cloudflare-turnstile",
      siteKey: "",
    },
  },
  {
    id: "haveIBeenPwned",
    name: "Have I Been Pwned",
    category: "utility",
    packageName: "better-auth/plugins",
    pluginKey: "haveIBeenPwned",
    description:
      "Memeriksa apakah kata sandi baru pernah bocor menggunakan k-Anonymity API.",
    defaultEnabled: true,
    endpoints: ["/api/auth/sign-up/email", "/api/auth/change-password"],
    settingsSchema: [
      {
        key: "customPasswordCompromisedMessage",
        label: "Custom Error Message",
        type: "text",
      },
    ],
    defaultSettings: {
      customPasswordCompromisedMessage:
        "Kata sandi terdeteksi dalam kebocoran data publik.",
    },
  },
  {
    id: "lastLoginMethod",
    name: "Last Login Method",
    category: "utility",
    packageName: "better-auth/plugins",
    pluginKey: "lastLoginMethod",
    clientPluginKey: "lastLoginMethodClient",
    description: "Menampilkan badge metode login yang terakhir digunakan user.",
    defaultEnabled: true,
    endpoints: ["Cookie Tracking"],
    settingsSchema: [
      { key: "cookieName", label: "Cookie Name", type: "text" },
      { key: "maxAge", label: "Max Age (detik)", type: "number" },
    ],
    defaultSettings: {
      cookieName: "authcore.last_used_login_method",
      maxAge: 2592000,
    },
  },
  {
    id: "oneTimeToken",
    name: "One-Time Token (OTT)",
    category: "utility",
    packageName: "better-auth/plugins",
    pluginKey: "oneTimeToken",
    clientPluginKey: "oneTimeTokenClient",
    description:
      "Generate dan verifikasi token sekali pakai untuk transfer sesi lintas domain.",
    defaultEnabled: false,
    endpoints: [
      "/api/auth/one-time-token/generate",
      "/api/auth/one-time-token/verify",
    ],
    settingsSchema: [
      { key: "expiresIn", label: "Expires In (menit)", type: "number" },
    ],
    defaultSettings: {
      expiresIn: 3,
    },
  },
  {
    id: "oauthProxy",
    name: "OAuth Proxy",
    category: "utility",
    packageName: "better-auth/plugins",
    pluginKey: "oauthProxy",
    description:
      "Proxy callback OAuth untuk preview deployment atau domain dinamis.",
    defaultEnabled: false,
    endpoints: ["/api/auth/oauth-proxy-callback"],
    settingsSchema: [
      { key: "currentURL", label: "Current Preview URL", type: "text" },
      { key: "productionURL", label: "Production URL", type: "text" },
    ],
    defaultSettings: {
      currentURL: "",
      productionURL: "https://auth.authcore.io",
    },
  },
  {
    id: "openAPI",
    name: "OpenAPI Docs",
    category: "utility",
    packageName: "better-auth/plugins",
    pluginKey: "openAPI",
    description:
      "Menghasilkan skema OpenAPI & dokumentasi Scalar interaktif di /api/auth/reference.",
    defaultEnabled: true,
    endpoints: ["/api/auth/reference", "/api/auth/open-api/generate-schema"],
    settingsSchema: [
      { key: "path", label: "Docs Endpoint Path", type: "text" },
      {
        key: "disableDefaultReference",
        label: "Disable Scalar UI",
        type: "boolean",
      },
    ],
    defaultSettings: {
      path: "/reference",
      disableDefaultReference: false,
    },
  },
  {
    id: "i18n",
    name: "i18n Error Translation",
    category: "utility",
    packageName: "@better-auth/i18n",
    pluginKey: "i18n",
    description:
      "Terjemahan otomatis pesan error autentikasi berdasarkan header/locale.",
    defaultEnabled: false,
    endpoints: ["Response Error Translator"],
    settingsSchema: [
      {
        key: "defaultLocale",
        label: "Default Locale",
        type: "select",
        options: ["id", "en"],
      },
    ],
    defaultSettings: {
      defaultLocale: "id",
    },
  },
  {
    id: "auditLogs",
    name: "Audit Logs",
    category: "utility",
    packageName: "@better-auth/infra",
    pluginKey: "auditLogs",
    description:
      "Perekaman seluruh event keamanan, login, perubahan RBAC, dan admin action.",
    defaultEnabled: readEnvBool("VITE_FEATURE_AUDIT_LOGS", true),
    endpoints: ["/api/auth/audit-logs"],
    settingsSchema: [
      { key: "retentionDays", label: "Retention (hari)", type: "number" },
      { key: "captureIP", label: "Capture Client IP & UA", type: "boolean" },
    ],
    defaultSettings: {
      retentionDays: 90,
      captureIP: true,
    },
  },

  // PAYMENTS
  {
    id: "stripe",
    name: "Stripe Billing",
    category: "payments",
    packageName: "@better-auth/stripe",
    pluginKey: "stripe",
    description:
      "Sinkronisasi customer, checkout, dan webhook subscription Stripe.",
    defaultEnabled: false,
    endpoints: ["/api/auth/stripe/webhook", "/api/auth/subscription/list"],
    settingsSchema: [
      {
        key: "createCustomerOnSignUp",
        label: "Create Customer On Sign-Up",
        type: "boolean",
      },
    ],
    defaultSettings: { createCustomerOnSignUp: true },
  },
  {
    id: "polar",
    name: "Polar Payments",
    category: "payments",
    packageName: "@polar-sh/better-auth",
    pluginKey: "polar",
    description:
      "Checkout, portal pelanggan, dan benefit usage-based dengan Polar.",
    defaultEnabled: false,
    endpoints: ["/api/auth/polar/webhooks"],
    settingsSchema: [
      {
        key: "environment",
        label: "Environment",
        type: "select",
        options: ["sandbox", "production"],
      },
    ],
    defaultSettings: { environment: "sandbox" },
  },
  {
    id: "autumn",
    name: "Autumn Billing",
    category: "payments",
    packageName: "autumn-js/better-auth",
    pluginKey: "autumn",
    description: "Pricing plans, entitlement check, dan metered billing.",
    defaultEnabled: false,
    endpoints: ["/api/auth/autumn/*"],
    settingsSchema: [{ key: "url", label: "Autumn API URL", type: "text" }],
    defaultSettings: { url: "" },
  },
  {
    id: "dodoPayments",
    name: "Dodo Payments",
    category: "payments",
    packageName: "@dodopayments/better-auth",
    pluginKey: "dodopayments",
    description:
      "Merchant of record global & manajemen langganan Dodo Payments.",
    defaultEnabled: false,
    endpoints: ["/api/auth/dodopayments/webhook"],
    settingsSchema: [
      {
        key: "environment",
        label: "Environment",
        type: "select",
        options: ["test_mode", "live_mode"],
      },
    ],
    defaultSettings: { environment: "test_mode" },
  },
  {
    id: "creem",
    name: "Creem Checkout",
    category: "payments",
    packageName: "@creem_io/better-auth",
    pluginKey: "creem",
    description: "Checkout SaaS, license key, dan subscription access control.",
    defaultEnabled: false,
    endpoints: ["/api/auth/creem/webhook"],
    settingsSchema: [{ key: "testMode", label: "Test Mode", type: "boolean" }],
    defaultSettings: { testMode: true },
  },
  {
    id: "chargebee",
    name: "Chargebee Billing",
    category: "payments",
    packageName: "@chargebee/better-auth",
    pluginKey: "chargebee",
    description: "Subscription enterprise & invoicing melalui Chargebee.",
    defaultEnabled: false,
    endpoints: ["/api/auth/chargebee/*"],
    settingsSchema: [{ key: "site", label: "Chargebee Site", type: "text" }],
    defaultSettings: { site: "" },
  },
];

export const BETTER_AUTH_FEATURE_MAP: Record<
  BetterAuthFeatureId,
  BetterAuthFeatureDefinition
> = Object.fromEntries(
  BETTER_AUTH_FEATURES.map((item) => [item.id, item]),
) as Record<BetterAuthFeatureId, BetterAuthFeatureDefinition>;

export interface FeatureRuntimeConfig {
  enabled: boolean;
  settings: Record<string, string | number | boolean>;
}

export type FeatureConfigMap = Record<
  BetterAuthFeatureId,
  FeatureRuntimeConfig
>;

export function buildDefaultFeatureConfigMap(): FeatureConfigMap {
  const map = {} as FeatureConfigMap;
  for (const feature of BETTER_AUTH_FEATURES) {
    map[feature.id] = {
      enabled: feature.defaultEnabled,
      settings: { ...feature.defaultSettings },
    };
  }
  return map;
}

export type ConfigPresetId = "minimal" | "saas" | "enterprise" | "full";

const PRESET_ENABLED_FEATURES: Record<ConfigPresetId, BetterAuthFeatureId[]> = {
  minimal: ["emailAndPassword", "sessionManagement", "rateLimit", "admin"],
  saas: [
    "emailAndPassword",
    "emailVerification",
    "accountLinking",
    "sessionManagement",
    "rateLimit",
    "twoFactor",
    "passkey",
    "magicLink",
    "emailOTP",
    "username",
    "socialGoogle",
    "socialGithub",
    "admin",
    "organization",
    "apiKey",
    "bearer",
    "jwt",
    "multiSession",
    "haveIBeenPwned",
    "lastLoginMethod",
    "openAPI",
    "auditLogs",
  ],
  enterprise: [
    "emailAndPassword",
    "emailVerification",
    "accountLinking",
    "sessionManagement",
    "rateLimit",
    "twoFactor",
    "passkey",
    "magicLink",
    "emailOTP",
    "username",
    "socialGoogle",
    "socialGithub",
    "socialMicrosoft",
    "admin",
    "organization",
    "apiKey",
    "oauthProvider",
    "mcp",
    "sso",
    "scim",
    "bearer",
    "jwt",
    "multiSession",
    "captcha",
    "haveIBeenPwned",
    "lastLoginMethod",
    "openAPI",
    "auditLogs",
  ],
  full: BETTER_AUTH_FEATURES.map((f) => f.id),
};

export function buildPresetFeatureConfigMap(
  preset: ConfigPresetId,
  current?: FeatureConfigMap,
): FeatureConfigMap {
  const base = current ?? buildDefaultFeatureConfigMap();
  const enabledSet = new Set(PRESET_ENABLED_FEATURES[preset]);
  const next = {} as FeatureConfigMap;
  for (const feature of BETTER_AUTH_FEATURES) {
    next[feature.id] = {
      enabled: enabledSet.has(feature.id),
      settings: { ...(base[feature.id]?.settings ?? feature.defaultSettings) },
    };
  }
  return next;
}

export function generateBetterAuthServerSnippet(
  config: FeatureConfigMap,
): string {
  const active = BETTER_AUTH_FEATURES.filter((f) => config[f.id]?.enabled);
  const corePlugins = active
    .filter((f) => f.packageName === "better-auth/plugins")
    .map((f) => f.pluginKey);
  const externalPackages = active.filter(
    (f) =>
      f.packageName !== "better-auth" &&
      f.packageName !== "better-auth/plugins",
  );
  const social = active.filter((f) => f.category === "social");

  const lines: string[] = [
    `import { betterAuth } from "better-auth";`,
    ...(corePlugins.length > 0
      ? [`import { ${corePlugins.join(", ")} } from "better-auth/plugins";`]
      : []),
    ...externalPackages.map(
      (f) => `import { ${f.pluginKey} } from "${f.packageName}";`,
    ),
    "",
    `export const auth = betterAuth({`,
    `  appName: "Auth Core",`,
    `  emailAndPassword: { enabled: ${Boolean(config.emailAndPassword?.enabled)} },`,
  ];

  if (social.length > 0) {
    lines.push(`  socialProviders: {`);
    for (const provider of social) {
      const key = provider.pluginKey.replace("socialProviders.", "");
      const upper = key.toUpperCase();
      lines.push(
        `    ${key}: { clientId: process.env.${upper}_CLIENT_ID!, clientSecret: process.env.${upper}_CLIENT_SECRET! },`,
      );
    }
    lines.push(`  },`);
  }

  const pluginCalls = [
    ...corePlugins.map((p) => `    ${p}(),`),
    ...externalPackages.map((f) => `    ${f.pluginKey}(),`),
  ];

  if (pluginCalls.length > 0) {
    lines.push(`  plugins: [`);
    lines.push(...pluginCalls);
    lines.push(`  ],`);
  }

  lines.push(`});`);
  return lines.join("\n");
}

export function generateBetterAuthClientSnippet(
  config: FeatureConfigMap,
): string {
  const activeClients = BETTER_AUTH_FEATURES.filter(
    (f) => config[f.id]?.enabled && f.clientPluginKey,
  );
  const coreClients = activeClients
    .filter((f) => f.packageName === "better-auth/plugins")
    .map((f) => f.clientPluginKey!);

  const lines: string[] = [
    `import { createAuthClient } from "better-auth/react";`,
    ...(coreClients.length > 0
      ? [
          `import { ${coreClients.join(", ")} } from "better-auth/client/plugins";`,
        ]
      : []),
    "",
    `export const authClient = createAuthClient({`,
    `  baseURL: import.meta.env.VITE_API_URL,`,
    `  plugins: [`,
    ...coreClients.map((c) => `    ${c}(),`),
    `  ],`,
    `});`,
  ];
  return lines.join("\n");
}

export function generateEnvSnippet(config: FeatureConfigMap): string {
  return BETTER_AUTH_FEATURES.map((f) => {
    const envKey = `VITE_FEATURE_${f.id.replace(/([A-Z])/g, "_$1").toUpperCase()}`;
    return `${envKey}=${Boolean(config[f.id]?.enabled)}`;
  }).join("\n");
}

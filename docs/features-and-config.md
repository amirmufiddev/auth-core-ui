# Fitur, Preset & Konfigurasi Runtime

**Auth Core** mengadopsi pendekatan **Hybrid Configuration**: nilai awal dibaca dari environment variables (`.env`), lalu dapat diubah secara dinamis saat runtime melalui **Feature & Plugin Manager** (`/auth-features`) dan disimpan di `localStorage`.

---

## 1. Kategori Fitur (54 Modul)

Semua definisi fitur berada di [src/config/better-auth.config.ts](../src/config/better-auth.config.ts) dan dikelompokkan dalam 7 kategori (`FEATURE_CATEGORY_META`):

| Kategori ID      | Label UI               | Contoh Fitur                                                                                                                                  |
| :--------------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`           | **Core & Session**     | `emailAndPassword`, `emailVerification`, `accountLinking`, `sessionManagement`, `rateLimit`                                                   |
| `authentication` | **Auth Methods**       | `twoFactor`, `passkey`, `magicLink`, `emailOTP`, `username`, `phoneNumber`, `anonymous`, `oneTap`, `siwe`, `genericOAuth`                     |
| `social`         | **Social OAuth**       | Google, GitHub, Microsoft, Apple, Discord, GitLab, Slack, LinkedIn, X/Twitter, Figma, Notion, Linear, Vercel                                  |
| `authorization`  | **RBAC & Tenant**      | `admin`, `organization`, `apiKey`, `agentAuth`                                                                                                |
| `enterprise`     | **OIDC & Enterprise**  | `oauthProvider`, `mcp`, `deviceAuthorization`, `sso`, `scim`                                                                                  |
| `utility`        | **Security & Utility** | `bearer`, `jwt`, `multiSession`, `captcha`, `haveIBeenPwned`, `lastLoginMethod`, `oneTimeToken`, `oauthProxy`, `openAPI`, `i18n`, `auditLogs` |
| `payments`       | **Payments**           | `stripe`, `polar`, `autumn`, `dodoPayments`, `creem`, `chargebee`                                                                             |

---

## 2. Preset Arsitektur Bawaan

Halaman `/auth-features` menyediakan 4 preset satu klik (`PRESET_ENABLED_FEATURES`):

1. **`minimal`** — Dasar autentikasi paling ringan: `emailAndPassword`, `sessionManagement`, `rateLimit`, `admin`.
2. **`saas`** — Paket standar aplikasi SaaS modern: Email/Password, Verifikasi Email, 2FA, Passkey, Magic Link, Email OTP, Username, Google & GitHub OAuth, Organisasi, API Key, JWT/Bearer, Multi-Session, HIBP, Last Login Method, OpenAPI, dan Audit Logs.
3. **`enterprise`** — Seluruh paket `saas` ditambah Microsoft OAuth, OAuth 2.1 Provider, MCP, Enterprise SSO (SAML/OIDC), SCIM Provisioning, dan Captcha Protection.
4. **`full`** — Mengaktifkan seluruh **54 fitur** di katalog untuk eksplorasi penuh.

---

## 3. Reaktifitas UI terhadap Feature Flags

Setiap komponen di UI membaca flag fitur dari `useAuthConfigStore`:

- **Halaman Login (`/login`)**:
  - Jika `emailAndPassword` dinonaktifkan → tab **Password**, form `SignInForm`, serta tautan **Daftar sekarang** otomatis disembunyikan; tab default otomatis beralih ke **OTP** atau **Magic Link**.
  - Jika `emailOTP` / `phoneNumber` aktif → tab **OTP** tampil beserta alur verifikasi 4 digit.
  - Jika `passkey` aktif → tombol **Masuk dengan Passkey (WebAuthn)** tampil.
  - Social providers hanya dirender sesuai provider yang aktif (`socialGoogle`, `socialGithub`, dll.).
- **Halaman Terproteksi (`/users`, `/roles`, `/organizations`, `/sessions`, `/api-keys`, `/audit-logs`)**:
  - Jika fitur induknya dimatikan (`admin`, `organization`, `sessionManagement`, `apiKey`, `auditLogs`), halaman menampilkan `FeatureDisabledCard` dengan tombol pintas ke `/auth-features` dan status di `AppSidebar` menampilkan badge `Off`.
- **Account Settings (`/account`)**:
  - Kartu seperti `ChangePasswordCard`, `TwoFactorCard`, `PasskeysCard`, `ProvidersCard`, `SessionsCard`, dan `ApiKeysCard` otomatis menyesuaikan status masing-masing fitur.

---

## 4. Environment Variables (`.env`)

Daftar variabel environment bawaan (lihat [.env.example](../.env.example)):

```env
VITE_API_URL=
VITE_AUTH_BASE_PATH=/api/auth
VITE_APP_NAME=Auth Core

VITE_FEATURE_EMAIL_PASSWORD=true
VITE_FEATURE_EMAIL_VERIFICATION=true
VITE_FEATURE_TWO_FACTOR=true
VITE_FEATURE_PASSKEY=true
VITE_FEATURE_MAGIC_LINK=true
VITE_FEATURE_EMAIL_OTP=true
VITE_FEATURE_USERNAME=true
VITE_FEATURE_PHONE_NUMBER=false
VITE_FEATURE_ANONYMOUS=false
VITE_FEATURE_ADMIN=true
VITE_FEATURE_ORGANIZATION=true
VITE_FEATURE_API_KEY=true
VITE_FEATURE_OAUTH_PROVIDER=true
VITE_FEATURE_MCP=true
VITE_FEATURE_SSO=true
VITE_FEATURE_SCIM=false
VITE_FEATURE_SOCIAL_GOOGLE=true
VITE_FEATURE_SOCIAL_GITHUB=true
VITE_FEATURE_BEARER=true
VITE_FEATURE_JWT=true
VITE_FEATURE_MULTI_SESSION=true
VITE_FEATURE_AUDIT_LOGS=true
```

---

## 5. Export Konfigurasi Siap Pakai

Melalui tombol **Export Konfigurasi** pada `/auth-features`, generator kode di `src/config/better-auth.config.ts` otomatis menghasilkan 3 tab keluaran berdasarkan fitur yang sedang aktif:

1. **`auth.ts`** (`generateBetterAuthServerSnippet`) — konfigurasi server beserta import plugin `better-auth/plugins` dan `socialProviders`.
2. **`auth-client.ts`** (`generateBetterAuthClientSnippet`) — konfigurasi client `createAuthClient` beserta plugin client yang sesuai.
3. **`.env`** — daftar flag `VITE_FEATURE_*` sesuai state runtime saat ini.

# Komponen Auth UI Mandiri

Seluruh komponen autentikasi, akun pribadi, dan organisasi di folder [src/components/better-auth/](../src/components/better-auth/index.ts) dibangun secara mandiri di atas primitif UI internal (`src/components/ui/*`), **tanpa** dependensi paket eksternal `better-auth-ui`.

---

## 1. Provider & Guards

### `AuthUIProvider`

Menghubungkan komponen UI dengan `useAuthStore`, `useAuthConfigStore`, router navigation (`@tanstack/react-router`), lokalisasi default, dan `basePaths` (`/login`, `/register`, `/forgot-password`, `/verify-2fa`, `/account`, `/organizations`, `/auth-features`).

```tsx
import { AuthUIProvider } from "@/components/better-auth";

<AuthUIProvider>{children}</AuthUIProvider>;
```

### Route & Render Guards (`src/components/better-auth/guards.tsx`)

| Komponen               | Fungsi                                                              |
| :--------------------- | :------------------------------------------------------------------ |
| `<SignedIn>`           | Merender `children` hanya jika user sedang login (`user !== null`). |
| `<SignedOut>`          | Merender `children` hanya jika tidak ada sesi user aktif.           |
| `<AuthLoading>`        | Placeholder loading saat status sesi belum siap.                    |
| `<RedirectToSignIn />` | Mengarahkan pengguna ke halaman login.                              |
| `<RedirectToSignUp />` | Mengarahkan pengguna ke halaman registrasi.                         |

---

## 2. Komponen Autentikasi (`auth/`)

| Komponen             | Kegunaan                                                                                                                                              |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthView`           | Orkes view utama untuk mode `SIGN_IN`, `SIGN_UP`, `FORGOT_PASSWORD`, `TWO_FACTOR`, `MAGIC_LINK`, dan `EMAIL_OTP`.                                     |
| `SignInForm`         | Form login email/username + kata sandi dengan tombol intip password, checkbox _Ingat saya_, status Captcha, dan tombol Demo Super Admin.              |
| `SignUpForm`         | Form registrasi lengkap dengan dukungan field `username` opsional dan indikator proteksi Have I Been Pwned.                                           |
| `EmailOTPForm`       | Alur 3-tahap animatif (**Request → 4-digit `InputOTP` Verification → Verified Celebration**) yang memicu perpindahan maskot `AuthMascot` antar panel. |
| `TwoFactorForm`      | Verifikasi 6-digit TOTP menggunakan `InputOTP` atau toggle **Gunakan Backup Code**, dilengkapi maskot 3D & selebrasi.                                 |
| `MagicLinkForm`      | Pengiriman tautan login sekali klik ke email.                                                                                                         |
| `PasskeyButton`      | Autentikasi WebAuthn / biometric passkey (tampil bila fitur `passkey` aktif).                                                                         |
| `ProviderButtons`    | Tombol OAuth sosial berbasis `@iconify/react` (Google, GitHub, Microsoft, dll.), Google One Tap, SIWE (Ethereum), dan Anonymous guest login.          |
| `ForgotPasswordForm` | Form permintaan tautan pemulihan kata sandi.                                                                                                          |

---

## 3. Animasi Halaman Login (`src/components/auth/`)

Layout `_auth` (`src/routes/_auth.tsx`) memadukan komponen visual berikut:

- **`AnimatedAuthBackground`**: Kanvas _full-bleed_ 60fps yang menggambar 30 kurva _silk-ribbon_ harmonis dan membaca variabel CSS tema aktif (`--primary`, `--tertiary`, `--chart-1`, `--chart-2`, `--chart-6`).
- **`AuthMascot`**: Maskot **3D Glossy Shield** vektor (`viewBox="0 0 120 132"`) dengan _idle float_, _3D mouse perspective tilt_, kedipan mata otomatis, _floating pill badge_, serta transisi `layoutId="authcore-mascot"` (`framer-motion`) agar maskot terbang mulus antara panel kiri dan panel kanan saat masuk tahap verifikasi OTP/2FA.
- **`AuthStageContext`**: Context + `LayoutGroup` untuk mengoordinasikan stage `default`, `otp`, `two-factor`, dan `verified` antara panel kiri dan kanan.

---

## 4. Komponen Akun (`account/`) & Organisasi (`organization/`)

### Account Components

- `AccountView` — Kontainer tab untuk `profile`, `security`, `sessions`, `api-keys`, dan `preferences`.
- `ProfileCards` — `UpdateAvatarCard`, `UpdateNameCard` (nama & username), `ChangeEmailCard`.
- `SecurityCards` — `ChangePasswordCard`, `TwoFactorCard` (setup TOTP + QR/secret + backup codes), `PasskeysCard`, `ProvidersCard` (link/unlink OAuth), `DeleteAccountCard`.
- `SessionsAndKeysCards` — `SessionsCard` & `ApiKeysCard` self-service.
- `ThemePreferencesCard` — Pengaturan tampilan lengkap (**Color Scheme**, **8 Color Palette Harmony**, **Navigation Layout**, **Sidebar Layout**, **Border Radius**, **Navbar Type**, **Footer Type**).

### User & Organization Components

- `UserButton` — Dropdown profil di header dengan _multi-session account switcher_ (hingga 5 akun tersimpan pada perangkat), pintasan ke `/account` dan `/auth-features`, serta tombol _Sign Out_.
- `OrganizationSwitcher` — Dropdown pergantian tenant aktif di header + tombol buat organisasi baru (`CreateOrganizationDialog`).
- `OrganizationView` — Kontainer manajemen organisasi terpadu (`OrganizationSettingsCards`, `OrganizationMembersCard`, `OrganizationInvitationsCard`, dan `OrganizationLogo`).

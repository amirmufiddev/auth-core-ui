<p align="center">
  <img src="./public/img/logo/logo.png" alt="Auth Core Logo" width="84" />
</p>

<h1 align="center">Auth Core — Centralized IAM &amp; Auth Service Console</h1>

<p align="center">
  Enterprise Identity &amp; Access Management (IAM) Console berbasis <strong>React 19</strong>, <strong>Vite</strong>, <strong>TanStack Router</strong>, <strong>Tailwind CSS v4</strong>, dan <strong>Better Auth</strong> yang sepenuhnya <em>runtime-configurable</em>.
</p>

<p align="center">
  <a href="./docs/architecture.md">Arsitektur</a> •
  <a href="./docs/features-and-config.md">Fitur &amp; Konfigurasi</a> •
  <a href="./docs/auth-ui-components.md">Komponen Auth UI</a> •
  <a href="./docs/design-system-and-theming.md">Design System &amp; Tema</a>
</p>

---

## Ringkasan Proyek

**Auth Core** adalah antarmuka konsol administrasi sekaligus library komponen autentikasi mandiri untuk mengelola identitas pengguna, sesi aktif, organisasi multi-tenant, RBAC dinamis, API Key, OAuth 2.1/OIDC, hingga audit trail keamanan.

Seluruh halaman autentikasi dan manajemen akun menyesuaikan secara otomatis (_reactive feature gating_) terhadap modul keamanan yang diaktifkan melalui halaman **Auth Features** (`/auth-features`) maupun file `.env`.

### Fitur Utama

- **Animated Split Login & OTP Verification** — Halaman masuk dua panel dengan latar kanvas _silk-ribbon_ dinamis (`AnimatedAuthBackground`), maskot 3D _glossy shield_ (`AuthMascot`) yang berpindah antar panel saat verifikasi OTP/2FA, serta input OTP 4/6 digit (`InputOTP`).
- **54 Fitur & Plugin Configurable** — Pengaturan terpusat untuk metode login (`Email & Password`, `Passkey`, `Magic Link`, `Email/Phone OTP`, `Username`, `SIWE`, `Google One Tap`, `13 Social OAuth Providers`), keamanan (`2FA TOTP`, `HIBP`, `Captcha`, `Rate Limiting`, `Audit Logs`), multi-tenant (`Organization`, `SSO`, `SCIM`), serta `API Keys`, `OAuth 2.1`, dan `MCP`.
- **Komponen Auth UI Mandiri (`src/components/better-auth/`)** — `AuthUIProvider`, `AuthView`, `AccountView`, `OrganizationView`, `UserButton`, `OrganizationSwitcher`, serta guards (`SignedIn`, `SignedOut`, `RedirectToSignIn`).
- **Hybrid API & Local Demo Mode** — Berjalan langsung di browser menggunakan Mock DB (`localStorage`) ketika `VITE_API_URL` dikosongkan, dan terhubung ke backend eksternal (`createAuthClient`) ketika `VITE_API_URL` diisi.
- **Multi-Tone Enterprise Design System** — 8 palet warna Tailwind CSS v4 (`Indigo & Sky`, `Ocean & Teal`, `Emerald & Cyan`, `Violet & Rose`, `Rose & Indigo`, `Amber & Teal`, `Teal & Violet`, `Slate & Cobalt`), dukungan penuh Light/Dark/System mode, serta kustomisasi tata letak langsung dari **Account Settings → Preferences**.

---

## Tech Stack

| Kategori              | Teknologi                                                                            |
| :-------------------- | :----------------------------------------------------------------------------------- |
| **Framework & Build** | React 19 (`^19.1.0`), TypeScript (`~5.8.3`), Vite (`^7.3.0`)                         |
| **Routing & Data**    | TanStack Router (`^1.120.2`), TanStack Query (`^5.76.1`), TanStack Table (`^8.21.3`) |
| **State & Form**      | Zustand (`^5.0.5`), React Hook Form (`^7.56.4`), Zod (`^3.24.4`)                     |
| **Auth Client**       | `better-auth` (`^1.2.8`)                                                             |
| **Styling & Motion**  | Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion, Radix UI Primitives            |
| **Icons & Charts**    | `lucide-react`, `@iconify/react`, Recharts (`^2.15.3`)                               |
| **Utilities**         | `react-virtuoso`, `input-otp`, `react-day-picker`, `date-fns`, `sonner`              |

---

## Quick Start

### 1. Prasyarat

- **Node.js** `>= 20` (atau **Bun** `>= 1.2`)
- **npm** / **bun**

### 2. Instalasi Dependensi

```bash
git clone git@github.com:amirmufiddev/auth-core-ui.git
cd auth-core-ui
npm install --legacy-peer-deps
```

> Catatan: Flag `--legacy-peer-deps` disarankan saat memakai `npm` karena peer dependency opsional framework server pada paket `better-auth`.

### 3. Konfigurasi Environment

Salin file contoh konfigurasi:

```bash
cp .env.example .env
```

Jika ingin menjalankan aplikasi langsung tanpa server backend (menggunakan **Local Hybrid Mode** / Mock DB di browser), biarkan `VITE_API_URL=` tetap kosong.

### 4. Jalankan Development Server

```bash
npm run dev
# atau
bun run dev
```

Buka browser ke URL yang tampil di terminal (umumnya `http://localhost:5173`).

### Kredensial Demo (Local Mode)

| Metode                   | Nilai                                                                |
| :----------------------- | :------------------------------------------------------------------- |
| **Email / Username**     | `admin@authcore.io` (atau tombol **Masuk Cepat (Demo Super Admin)**) |
| **Kata Sandi**           | `password123` (minimal 4 karakter pada mode demo lokal)              |
| **Kode Email/Phone OTP** | `1234` (4 digit)                                                     |
| **Kode 2FA TOTP**        | `123456` (6 digit)                                                   |

---

## Struktur Direktori

```text
.
├── public/
│   └── img/logo/               # Aset logo resmi (logo.png, logo-2.png, logo-white.png)
├── docs/                       # Dokumentasi lengkap arsitektur, fitur, komponen, dan tema
├── scripts/
│   └── routes.test.mjs         # Test sinkronisasi menu, route, feature catalog, dan guard
├── src/
│   ├── api/
│   │   ├── client.ts           # HTTP client + deteksi VITE_API_URL
│   │   ├── auth-service.ts     # Service adapter (External API <-> Mock DB)
│   │   └── mock-db.ts          # Data simulasi (users, roles, orgs, sessions, audit logs)
│   ├── components/
│   │   ├── auth/               # AnimatedAuthBackground, AuthMascot, AuthStageContext
│   │   ├── better-auth/        # Library komponen Auth UI mandiri
│   │   ├── layout/             # AppLogo, AppSidebar, Header, Footer, ImpersonationBanner
│   │   └── ui/                 # Primitif UI berbasis Radix + Tailwind v4
│   ├── config/
│   │   ├── better-auth.config.ts  # Katalog 54 fitur, preset, & code snippet generator
│   │   ├── menus.ts            # Konfigurasi navigasi terpadu (mainNav, modern, classic)
│   │   └── site.ts             # Metadata aplikasi Auth Core
│   ├── features/               # Halaman modul (dashboard, users, roles, orgs, sessions, dll.)
│   ├── lib/
│   │   ├── auth-client.ts      # Instance createAuthClient + 15 plugin client
│   │   ├── rbac.ts             # Matriks permission RBAC & generator TypeScript
│   │   └── utils.ts            # Helper cn(), formatDate(), dll.
│   ├── routes/                 # File-based routing TanStack Router (_auth & _authenticated)
│   └── stores/                 # Zustand stores (Auth, AuthConfig, Theme, Layout)
├── index.html
└── vite.config.ts
```

---

## Daftar Halaman & Route

| Route              | Halaman            | Deskripsi                                                                                     |
| :----------------- | :----------------- | :-------------------------------------------------------------------------------------------- |
| `/login`           | Sign In            | Split login animatif (Password, OTP 4-digit, Magic Link, Passkey, Social OAuth)               |
| `/register`        | Sign Up            | Registrasi akun baru dengan pengecekan fitur `emailAndPassword` & `username`                  |
| `/forgot-password` | Reset Password     | Permintaan tautan reset kata sandi                                                            |
| `/verify-2fa`      | Two-Factor Auth    | Verifikasi TOTP 6 digit atau Backup Recovery Code                                             |
| `/dashboard`       | Service Overview   | KPI ringkas, grafik tren 14 hari, distribusi metode login, & aktivitas terbaru                |
| `/users`           | User Management    | Tabel pengguna, filter, buat akun, edit role, ban/unban, & impersonation                      |
| `/roles`           | Roles & RBAC       | Editor matriks izin berbasis resource/action + export TypeScript `permissions.ts`             |
| `/organizations`   | Multi-Tenant Org   | Kelola organisasi, anggota, sub-tim, undangan, & status SSO                                   |
| `/sessions`        | Sessions & Devices | Pemantauan sesi aktif per perangkat/IP, device trust, & revoke massal                         |
| `/api-keys`        | API Keys & OAuth   | Penerbitan API key, rate limit, scope, & manajemen OAuth 2.1 / MCP clients                    |
| `/audit-logs`      | Audit Logs         | Event stream tervirtualisasi (`react-virtuoso`), filter date range & severity, JSON inspector |
| `/auth-features`   | Feature Manager    | Toggle 54 fitur, preset arsitektur (`minimal`/`saas`/`enterprise`/`full`), & export config    |
| `/account`         | Account Settings   | Profil, Keamanan (2FA, Passkey, Providers), Sessions/API Keys, & Theme Preferences            |

---

## Scripts & Verifikasi

| Perintah                      | Fungsi                                                                                                         |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `npm run dev` / `bun run dev` | Menjalankan Vite dev server                                                                                    |
| `npm run typecheck`           | Pengecekan tipe TypeScript (`tsc -b --noEmit`)                                                                 |
| `npm run lint`                | Menjalankan ESLint di seluruh proyek                                                                           |
| `npm run test:routes`         | Menjalankan unit test sinkronisasi menu, route, dan integritas katalog (`node --test scripts/routes.test.mjs`) |
| `npm run build`               | Type-check + build produksi ke folder `dist/` (`tsc -b && vite build`)                                         |
| `npm run preview`             | Preview hasil build produksi                                                                                   |

---

## Dokumentasi Lanjutan

- [Arsitektur & Hybrid API Mode](./docs/architecture.md)
- [Panduan Fitur, Preset & Konfigurasi](./docs/features-and-config.md)
- [Dokumentasi Komponen Auth UI Mandiri](./docs/auth-ui-components.md)
- [Design System, Multi-Tone Tokens & Kustomisasi Tema](./docs/design-system-and-theming.md)

---

## Lisensi

Proyek ini dirilis di bawah lisensi MIT — lihat file [LICENSE](./LICENSE).

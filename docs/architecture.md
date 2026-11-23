# Arsitektur Aplikasi — Auth Core

Dokumen ini menjelaskan arsitektur teknis **Auth Core**, alur data _Hybrid Mode_ (External API vs Local Mock DB), manajemen state, routing, dan sistem RBAC.

---

## 1. Gambaran Umum Arsitektur

```text
+-------------------------------------------------------------------+
|                        TanStack Router                             |
|   /_auth (Guest Only)               /_authenticated (Protected)    |
|   - /login, /register               - /dashboard, /users, /roles   |
|   - /forgot-password, /verify-2fa   - /organizations, /sessions    |
|                                     - /api-keys, /audit-logs       |
|                                     - /auth-features, /account     |
+-------------------------------+-----------------------------------+
                                |
                                v
+-------------------------------------------------------------------+
|                  Zustand Stores & React Query                      |
|  - useAuthStore       (Sesi aktif, multi-account, impersonation)   |
|  - useAuthConfigStore (54 Feature flags + parameter runtime)       |
|  - useThemeStore      (Light/Dark/System, 8 Palet, Radius, Bars)   |
|  - useLayoutStore     (navStyle, sidebarType, collapsed state)     |
+-------------------------------+-----------------------------------+
                                |
          +---------------------+---------------------+
          |                                           |
          v (VITE_API_URL terisi)                     v (VITE_API_URL kosong / fallback)
+---------------------------+           +-------------------------------+
|  External Better Auth API |           |     Local Hybrid Mock DB      |
|  src/lib/auth-client.ts   |           |     src/api/mock-db.ts        |
|  src/api/client.ts        |           |     (localStorage persisted)  |
+---------------------------+           +-------------------------------+
```

---

## 2. Mode Operasi Hybrid (`VITE_API_URL`)

Pemeriksaan mode dilakukan di [src/api/client.ts](../src/api/client.ts):

- `isExternalBackendConfigured()` mengembalikan `true` jika `import.meta.env.VITE_API_URL` memiliki nilai non-kosong.
- **Ketika `VITE_API_URL` kosong (Default / Local Hybrid Mode)**:
  - Seluruh operasi CRUD (`users`, `roles`, `organizations`, `sessions`, `apiKeys`, `auditLogs`, serta proses autentikasi) berjalan sepenuhnya di browser menggunakan `src/api/mock-db.ts` dan disimpan di `localStorage`.
  - Setiap aksi sensitif otomatis mencatat entri baru ke `auditLogs` secara _real-time_.
- **Ketika `VITE_API_URL` diisi**:
  - `src/lib/auth-client.ts` menginisialisasi `createAuthClient` dengan `credentials: "include"` beserta 15 plugin client (`adminClient`, `organizationClient`, `twoFactorClient`, `magicLinkClient`, `emailOTPClient`, `usernameClient`, `phoneNumberClient`, `anonymousClient`, `multiSessionClient`, `oneTapClient`, `jwtClient`, `deviceAuthorizationClient`, `siweClient`, `lastLoginMethodClient`, `oneTimeTokenClient`).
  - `src/api/auth-service.ts` dan `src/stores/useAuthStore.ts` memanggil endpoint eksternal terlebih dahulu, dengan fallback aman ke mock DB apabila endpoint eksternal belum tersedia.

---

## 3. File-Based Routing & Route Guards

Proyek menggunakan `@tanstack/router-plugin/vite` (`src/routeTree.gen.ts` ter-generate otomatis):

1. **Guest Routes (`src/routes/_auth.tsx`)**
   - `beforeLoad` memeriksa `useAuthStore.getState().user`; jika user sudah login, otomatis redirect ke `/dashboard`.
   - Merender layout **Animated Split Frame** (`AnimatedAuthBackground` + `AuthMascot` + `<Outlet />`).
2. **Authenticated Routes (`src/routes/_authenticated.tsx`)**
   - `beforeLoad` memeriksa sesi user; jika belum login, redirect ke `/login`.
   - Merender shell utama: `AppSidebar`, `Header`, `ImpersonationBanner` (muncul saat admin meng-impersonate user lain), `<Outlet />`, dan `Footer`.
3. **Sinkronisasi Navigasi (`src/config/menus.ts`)**
   - Seluruh item menu didefinisikan satu kali di `applicationItems` lalu didistribusikan ke `mainNav`, `sidebarNav.modern`, dan `sidebarNav.classic`.
   - Script uji `scripts/routes.test.mjs` memastikan seluruh route di `menus.ts` memiliki file route di `src/routes/_authenticated/` dan ketiganya selalu sinkron.

---

## 4. State Management (`src/stores/`)

| Store                   | Key `localStorage`                       | Tanggung Jawab                                                                                                                                     |
| :---------------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAuthStore.ts`       | `authcore-auth-snapshot`                 | Sesi aktif, `deviceAccounts` (multi-session hingga 5 akun), `impersonatedBy`, `pending2FA`, `lastLoginMethod`, serta aksi profil/keamanan mandiri. |
| `useAuthConfigStore.ts` | `authcore-feature-config`                | Menyimpan status `enabled` dan `settings` dari 54 fitur, preset aktif, toggle berantai (dependency check), dan reset ke konfigurasi `.env`.        |
| `useThemeStore.ts`      | `authcore-theme`, `authcore-theme-prefs` | Mode `light`/`dark`/`system`, `colorTheme` (8 palet), `radius`, `navbarType`, dan `footerType`.                                                    |
| `useLayoutStore.ts`     | —                                        | Gaya navigasi (`vertical` / `horizontal`), `sidebarType` (`module` / `classic` / `popover`), status `sidebarCollapsed`, dan drawer mobile.         |

---

## 5. Sistem RBAC (`src/lib/rbac.ts`)

Editor di halaman `/roles` mengelola permission statement per resource:

- **Resources & Actions** didefinisikan terstruktur untuk modul `user`, `session`, `organization`, `member`, `invitation`, `apiKey`, `auditLogs`, dan `authConfig`.
- Perubahan matriks izin di UI dapat langsung diekspor sebagai file TypeScript `permissions.ts` (`createAccessControl(...)`) yang siap dipakai pada konfigurasi server.

---

## 6. Kualitas Kode & Pengujian

- **No Next.js Dependencies**: Seluruh aplikasi murni SPA React + Vite (diverifikasi oleh `scripts/routes.test.mjs`).
- **Standardized Forms & Tables**: Seluruh formulir memakai `react-hook-form` + `zod`, tabel memakai `DataTable` (`@tanstack/react-table`), dan stream audit log memakai virtual scrolling `react-virtuoso`.

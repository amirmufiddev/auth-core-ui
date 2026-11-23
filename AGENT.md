## Learned User Preferences
1. Selalu merespons dalam Bahasa Indonesia.
2. Jangan pernah menjalankan atau me-restart server (`bun dev`, `bun start`, `bun preview`, dsb.) tanpa konfirmasi eksplisit; user me-restart secara manual.
3. Untuk list besar di frontend, user secara konsisten meminta **`react-virtuoso` + `useInfiniteQuery`** (TanStack Query); jangan gunakan paginasi manual atau list biasa tanpa virtualisasi.


## 1. ATURAN WAJIB: Gunakan Komponen yang Sudah Ada di `src/components/ui`

**WAJIB menggunakan komponen yang sudah tersedia di [`src/components/ui/`](src/components/ui) (`@/components/ui/*`).**

1. **Dilarang membuat komponen UI dasar baru** (seperti custom button, card, input, modal, badge, table, tabs, accordion, checkbox, switch, select, progress, alert, avatar, dll.) jika fungsinya sudah dapat dipenuhi oleh komponen di `@/components/ui/*`.
2. **Dilarang duplikasi styling primitif** menggunakan raw `<button>`, `<input>`, `<table>`, atau `<div>` bergaya modal/kartu ketika komponen padanannya tersedia di `src/components/ui/`.
3. **Jika benar-benar perlu membuat komponen baru**, **WAJIB memeriksa isi `src/components/ui/` terlebih dahulu** dan **meminta konfirmasi user sebelum membuat komponen baru**.
4. **Komposisi diperbolehkan langsung di dalam file route (`src/routes/`) atau container fitur (`src/features/`)** dengan menyusun komponen dari `src/components/ui/`, `lucide-react`, dan utility `cn()` dari `@/lib/utils`.
5. Untuk komponen table selalu gunakan `<DataTable>` (TanStack Table) dengan server-side pagination, filter, sort, dan search.
6. Selalu gunakan komponen `<DatePicker>` atau `<TimePicker>` untuk date dan time selection.


### Daftar Komponen Tersedia di `src/components/ui/`

- **Layout & Pembungkus**: `card`, `separator`, `scroll-area`, `resizable`, `affix`, `aspect-ratio`, `card-snippet`
- **Form & Kontrol Input**: `input`, `input-group`, `textarea`, `label`, `form`, `select`, `checkbox`, `switch`, `radio-group`, `slider`, `toggle`, `autocomplete`, `cleave`, `calendar`, `command`, `rating`
- **Interaksi & Overlay**: `button`, `dialog`, `alert-dialog`, `drawer`, `sheet`, `popover`, `hover-card`, `tooltip`, `dropdown-menu`
- **Navigasi & Struktur**: `accordion`, `tabs`, `breadcrumbs`, `navigation-menu`, `menubar`, `pagination`, `steps`, `collapsible`, `tree`
- **Display & Feedback**: `table`, `badge`, `avatar`, `alert`, `progress`, `skeleton`, `timeline`, `kbd`, `carousel`, `toast`, `toaster`, `sonner`, `watermark`

---

## 2. Kepatuhan Design System (`DESIGN.MD`)

- Rujuk [`DESIGN.MD`](DESIGN.MD) untuk token warna, tipografi (`Inter`), radius, spacing, dan pola layout halaman.
- Gunakan semantic Tailwind v4 tokens (`bg-card`, `text-default-900`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, `text-success`, dll.) agar **Light Mode dan Dark Mode** bekerja otomatis. Jangan hardcode warna hex di JSX bila token semantik sudah ada.
- Gunakan ikon dari `lucide-react` di dalam konten halaman, dan ikon dari `lucide-react` atau SVG dari `@/components/svg` pada konfigurasi navigasi [`src/config/menus.ts`](src/config/menus.ts).

---

## 3. Konvensi React 19, Vite, TanStack Router, & Menu

- **Arsitektur SPA (Client-Side)**: Proyek menggunakan **React 19 + Vite + TypeScript** (bukan Next.js). Jangan gunakan direktif `'use client'`/`'use server'`, `next/*` imports, Server Components, atau `next-safe-action`.
- **Struktur Direktori Feature-Based (`src/`)**:
  - `src/routes/`: File-based routes **TanStack Router** (mis. `__root.tsx`, `_auth/login.tsx`, `_authenticated/<route>.tsx` yang otomatis mewarisi shell layout dashboard).
  - `src/features/<feature>/`: Modul fitur/CRUD (berisi `components/`, `hooks/` untuk TanStack Query, `schema.ts` untuk Zod, dan `types.ts`).
  - `src/components/layout/`: Komponen shell layout (`AppSidebar`, `Header`, `Breadcrumbs`, `ProtectedRoute`).
  - `src/api/`: HTTP client / fetch wrapper & interceptor untuk komunikasi ke backend / Better Auth API.
  - `src/stores/`: Client state global menggunakan **Zustand** (bila diperlukan).
- **Routing, Auth Guard, & Search Params**:
  - Gunakan `beforeLoad` pada layout route terproteksi (mis. `_authenticated.tsx`) atau `ProtectedRoute` untuk mengecek sesi **Better Auth** (`better-auth/react`) dan mengarahkan user yang belum login ke `/login`.
  - Gunakan `validateSearch` (dengan schema **Zod**) dan `Route.useSearch()` dari `@tanstack/react-router` untuk membaca/menulis query params secara type-safe.
  - Validasi form menggunakan **React Hook Form + Zod** (`@hookform/resolvers/zod`) dan kirim mutasi data melalui **TanStack Query** (`useMutation`).
- **Konfigurasi Menu**: Setiap penambahan halaman di Menu **Application** atau **Pages** harus didaftarkan secara konsisten pada **ketiga** blok navigasi di [`src/config/menus.ts`](src/config/menus.ts):
  1. `menusConfig.mainNav`
  2. `menusConfig.sidebarNav.modern`
  3. `menusConfig.sidebarNav.classic`
- **Detail Komponen UI & Feedback**:
  - `CardHeader` punya default `mb-6 border-b border-border`; gunakan `mb-0` bila tidak memakai divider/spacing bawah besar (misal sebelum `Table` dengan `CardContent className="p-0"`).
  - `Checkbox` menerima `size` (`xs`..`xl`), `color`, `variant`, `checked`, `onCheckedChange`. Untuk grid 2 kolom di dalam `AccordionContent`, pasangkan `Checkbox` dengan `Label htmlFor={...}`.
  - Gunakan `sonner` (`toast.success`, `toast.error`) untuk feedback aksi user.

---

## 4. Checklist Verifikasi Sebelum Selesai

Setelah melakukan perubahan kode, wajib menjalankan dan memastikan seluruh pemeriksaan berikut lolos (`exit code 0`):

```bash
npx tsc --noEmit
npx eslint src/config/menus.ts src/routes/<file-terkait>.tsx
bun run test:routes
bun run build
```

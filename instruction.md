Gunakan skill init-admin-dashboard (opsi React 19 + Vite + TanStack Router) dan jadikan DESIGN.MD serta design tokens dari using-dashtail-template sebagai acuan tema Light/Dark dan struktur layout-nya.

Kebutuhan project:

- Nama aplikasi: Auth Core
- Gunakan Better Auth untuk autentikasi & RBAC
- Implementasi semua fitur yang ada di Better Auth namun configurable (bisa di aktifkan / non aktif) karna kita akan membangun Auth Service
- Gunakan TanStack Table + React Hook Form + Zod + next-safe-action untuk modul CRUD <mis. Users & Roles>.
- Gunakan Zustand untuk client state global bila diperlukan.
- Wajib gunakan komponen UI yang sudah ada di components/ui/* (jangan buat komponen primitif baru tanpa izin) dan ikuti DESIGN.MD serta AGENT.MD.
- Daftarkan halaman baru ke Menu Application di config/menus.ts (mainNav, sidebarNav.modern, sidebarNav.classic).
- Verifikasi dengan tsc --noEmit, eslint, test:routes, dan build.

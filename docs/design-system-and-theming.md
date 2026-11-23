# Design System & Multi-Tone Theming

**Auth Core** menggunakan **Tailwind CSS v4** dengan sistem **Semantic Design Tokens** berlapis (`@theme inline` di [src/index.css](../src/index.css)) sehingga seluruh komponen, chart, sidebar, maupun animasi latar login berubah serentak mengikuti tema pilihan pengguna.

---

## 1. Tipografi

Konfigurasi font dimuat melalui Google Fonts di [index.html](../index.html) dan dipetakan di `@theme inline`:

| Token Tailwind                    | Font Stack                    | Penggunaan                                                                              |
| :-------------------------------- | :---------------------------- | :-------------------------------------------------------------------------------------- |
| `--font-sans` / `font-sans`       | **DM Sans**, Inter, system-ui | Seluruh teks UI, label form, tabel, dan badge (`tabular-nums` untuk angka/timestamp/ID) |
| `--font-display` / `font-display` | **Outfit**, DM Sans           | Wordmark brand dan judul utama                                                          |
| `--font-mono` / `font-mono`       | **JetBrains Mono**, monospace | Khusus blok pratinjau kode & konfigurasi JSON (`<pre>`)                                 |

---

## 2. Token Warna Multi-Tone Tailwind v4

Alih-alih hanya mengandalkan `primary` dan `secondary`, sistem warna menggunakan token lengkap untuk permukaan, aksen pelengkap, sidebar, status lembut, dan grafik:

| Kelompok Token            | Daftar Token                                                                                                                     |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| **Permukaan (Surface)**   | `--background`, `--foreground`, `--card`, `--popover`, `--page-bg`, `--surface-subtle`                                           |
| **Brand Utama (Primary)** | `--primary`, `--primary-foreground`, `--primary-soft`, `--primary-soft-foreground`, `--primary-50..950`                          |
| **Sekunder & Aksen**      | `--secondary`, `--secondary-foreground`, `--accent`, `--accent-foreground`, `--muted`, `--muted-foreground`                      |
| **Pelengkap (Tertiary)**  | `--tertiary`, `--tertiary-foreground`, `--tertiary-soft`, `--tertiary-soft-foreground`                                           |
| **Sidebar**               | `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`                       |
| **Status (Solid & Soft)** | `--success` / `--success-soft`, `--info` / `--info-soft`, `--warning` / `--warning-soft`, `--destructive` / `--destructive-soft` |
| **Grafik & Kategori**     | `--chart-1`, `--chart-2`, `--chart-3`, `--chart-4`, `--chart-5`, `--chart-6`                                                     |

---

## 3. Delapan Palet Tema Harmonis

Setiap palet didefinisikan untuk **Light Mode** (`:root:not(.dark)[data-color-theme="..."]`) dan **Dark Mode** (`:root.dark[data-color-theme="..."]`) di `src/index.css`:

| ID Tema              | Label              | Primary ↔ Tertiary (Light) | Karakteristik          |
| :------------------- | :----------------- | :------------------------- | :--------------------- |
| `indigo` _(default)_ | **Indigo & Sky**   | `#4f46e5` ↔ `#0ea5e9`      | Enterprise SaaS modern |
| `ocean`              | **Ocean & Teal**   | `#2563eb` ↔ `#0d9488`      | Corporate Cloud        |
| `emerald`            | **Emerald & Cyan** | `#059669` ↔ `#0891b2`      | Fintech Fresh          |
| `violet`             | **Violet & Rose**  | `#7c3aed` ↔ `#db2777`      | Modern Product         |
| `rose`               | **Rose & Indigo**  | `#e11d48` ↔ `#4f46e5`      | Bold Executive         |
| `amber`              | **Amber & Teal**   | `#d97706` ↔ `#0d9488`      | Warm Editorial         |
| `teal`               | **Teal & Violet**  | `#0d9488` ↔ `#7c3aed`      | Calm Security          |
| `slate`              | **Slate & Cobalt** | `#1e293b` ↔ `#2563eb`      | Minimalist Pro         |

---

## 4. Kustomisasi Preferensi User & Anti-FOUC

Pengguna dapat menyesuaikan tampilan secara langsung di **`/account?tab=preferences`** (`ThemePreferencesCard`):

- **Color Scheme**: `Light`, `Dark`, atau `System` (mengikuti OS secara otomatis).
- **Color Palette Harmony**: 8 palet warna dengan kartu pratinjau 4-titik warna (_Primary, Tertiary, Accent, Canvas_).
- **Navigation Layout**: `Vertical` (sidebar sticky penuh) atau `Horizontal` (menubar di bawah header).
- **Sidebar Layout**: `Module` (lebar `w-72`), `Classic` (lebar `w-64`), atau `Popover` (ikon ringkas `w-18.5` dengan tooltip).
- **Border Radius**: `0rem`, `0.3rem`, `0.5rem`, `0.75rem`, atau `1rem`.
- **Navbar Type**: `Sticky`, `Static`, `Floating`, atau `Hidden`.
- **Footer Type**: `Sticky`, `Static`, atau `Hidden`.

Untuk mencegah kedipan layar (_Flash of Unstyled Content_) saat halaman dimuat ulang, skrip inline pada `<head>` di `index.html` membaca `authcore-theme` dan `authcore-theme-prefs` dari `localStorage` dan langsung menyetel class `.dark`, atribut `data-color-theme`, serta `--radius` sebelum React di-mount.

---

## 5. Aset Logo Brand

Aset logo tersimpan di `public/img/logo/` dan dikelola terpusat oleh komponen [AppLogo](../src/components/layout/AppLogo.tsx):

- `/img/logo/logo.png` — Varian biru & hitam untuk Light Mode dan favicon.
- `/img/logo/logo-2.png` — Varian biru & putih untuk Dark Mode maupun latar gelap (`forceDark`).
- `/img/logo/logo-white.png` — Varian monokrom putih.

import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";
export type ColorThemeId =
  | "indigo"
  | "ocean"
  | "emerald"
  | "violet"
  | "rose"
  | "amber"
  | "teal"
  | "slate";
export type RadiusOption = 0 | 0.3 | 0.5 | 0.75 | 1;
export type NavbarType = "sticky" | "static" | "floating" | "hidden";
export type FooterType = "sticky" | "static" | "hidden";

export interface ColorThemeDefinition {
  id: ColorThemeId;
  label: string;
  subtitle: string;
  /** Preview swatch dots rendered in ThemePreferencesCard (primary, tertiary, accent, surface) */
  swatches: {
    light: [string, string, string, string];
    dark: [string, string, string, string];
  };
}

export const COLOR_THEMES: ColorThemeDefinition[] = [
  {
    id: "indigo",
    label: "Indigo & Sky",
    subtitle: "Enterprise SaaS",
    swatches: {
      light: ["#4f46e5", "#0ea5e9", "#e8eeff", "#f5f7fc"],
      dark: ["#818cf8", "#38bdf8", "#1d2747", "#080c18"],
    },
  },
  {
    id: "ocean",
    label: "Ocean & Teal",
    subtitle: "Corporate Cloud",
    swatches: {
      light: ["#2563eb", "#0d9488", "#e0f2fe", "#f3f8fd"],
      dark: ["#60a5fa", "#2dd4bf", "#142c4c", "#070e1a"],
    },
  },
  {
    id: "emerald",
    label: "Emerald & Cyan",
    subtitle: "Fintech Fresh",
    swatches: {
      light: ["#059669", "#0891b2", "#d1fae5", "#f3faf7"],
      dark: ["#34d399", "#22d3ee", "#11352a", "#061310"],
    },
  },
  {
    id: "violet",
    label: "Violet & Rose",
    subtitle: "Modern Product",
    swatches: {
      light: ["#7c3aed", "#db2777", "#ede9fe", "#f8f6fd"],
      dark: ["#a78bfa", "#f472b6", "#271b4a", "#0c0918"],
    },
  },
  {
    id: "rose",
    label: "Rose & Indigo",
    subtitle: "Bold Executive",
    swatches: {
      light: ["#e11d48", "#4f46e5", "#ffe4e6", "#fcf6f7"],
      dark: ["#fb7185", "#818cf8", "#3a1624", "#15090e"],
    },
  },
  {
    id: "amber",
    label: "Amber & Teal",
    subtitle: "Warm Editorial",
    swatches: {
      light: ["#d97706", "#0d9488", "#fef0c7", "#fcfaf4"],
      dark: ["#fbbf24", "#2dd4bf", "#382810", "#141008"],
    },
  },
  {
    id: "teal",
    label: "Teal & Violet",
    subtitle: "Calm Security",
    swatches: {
      light: ["#0d9488", "#7c3aed", "#ccfbf1", "#f3faf9"],
      dark: ["#2dd4bf", "#a78bfa", "#113636", "#071314"],
    },
  },
  {
    id: "slate",
    label: "Slate & Cobalt",
    subtitle: "Minimalist Pro",
    swatches: {
      light: ["#1e293b", "#2563eb", "#e2e8f0", "#f8fafc"],
      dark: ["#f1f5f9", "#60a5fa", "#1e293b", "#090d16"],
    },
  },
];

const LEGACY_THEME_MAP: Record<string, ColorThemeId> = {
  blue: "ocean",
  red: "rose",
  orange: "amber",
  yellow: "amber",
  zinc: "slate",
  stone: "slate",
  gray: "slate",
  neutral: "slate",
};

const THEME_STORAGE_KEY = "authcore-theme";
const PREFS_STORAGE_KEY = "authcore-theme-prefs";

interface StoredPreferences {
  colorTheme: ColorThemeId;
  radius: RadiusOption;
  navbarType: NavbarType;
  footerType: FooterType;
}

const DEFAULT_PREFS: StoredPreferences = {
  colorTheme: "indigo",
  radius: 0.5,
  navbarType: "sticky",
  footerType: "static",
};

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  return mode === "system" ? getSystemTheme() : mode;
}

function readInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "light";
}

function normalizeColorTheme(raw?: string): ColorThemeId {
  if (!raw) return DEFAULT_PREFS.colorTheme;
  const mapped = LEGACY_THEME_MAP[raw] ?? raw;
  return COLOR_THEMES.some((c) => c.id === mapped)
    ? (mapped as ColorThemeId)
    : DEFAULT_PREFS.colorTheme;
}

function readInitialPrefs(): StoredPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    const validColor = normalizeColorTheme(parsed.colorTheme);
    const validRadius = ([0, 0.3, 0.5, 0.75, 1] as RadiusOption[]).includes(
      parsed.radius as RadiusOption
    )
      ? (parsed.radius as RadiusOption)
      : DEFAULT_PREFS.radius;
    const validNavbar = (
      ["sticky", "static", "floating", "hidden"] as NavbarType[]
    ).includes(parsed.navbarType as NavbarType)
      ? (parsed.navbarType as NavbarType)
      : DEFAULT_PREFS.navbarType;
    const validFooter = (
      ["sticky", "static", "hidden"] as FooterType[]
    ).includes(parsed.footerType as FooterType)
      ? (parsed.footerType as FooterType)
      : DEFAULT_PREFS.footerType;
    return {
      colorTheme: validColor,
      radius: validRadius,
      navbarType: validNavbar,
      footerType: validFooter,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: StoredPreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage quota errors
  }
}

function applyThemeToDom(
  resolved: "light" | "dark",
  colorTheme: ColorThemeId,
  radius: RadiusOption
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.setAttribute("data-color-theme", colorTheme);
  root.style.setProperty("--radius", `${radius}rem`);

  // Clear legacy inline overrides so CSS Tailwind tokens under [data-color-theme] always apply
  root.style.removeProperty("--primary");
  root.style.removeProperty("--primary-foreground");
  root.style.removeProperty("--ring");
}

interface ThemeStoreState {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  colorTheme: ColorThemeId;
  radius: RadiusOption;
  navbarType: NavbarType;
  footerType: FooterType;
  setTheme: (theme: ThemeMode) => void;
  setColorTheme: (colorTheme: ColorThemeId) => void;
  setRadius: (radius: RadiusOption) => void;
  setNavbarType: (navbarType: NavbarType) => void;
  setFooterType: (footerType: FooterType) => void;
  resetPreferences: () => void;
  toggleTheme: () => void;
  syncFromSystem: () => void;
}

const initialTheme = readInitialTheme();
const initialResolved = resolveTheme(initialTheme);
const initialPrefs = readInitialPrefs();
applyThemeToDom(initialResolved, initialPrefs.colorTheme, initialPrefs.radius);

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,
  colorTheme: initialPrefs.colorTheme,
  radius: initialPrefs.radius,
  navbarType: initialPrefs.navbarType,
  footerType: initialPrefs.footerType,

  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    applyThemeToDom(resolved, get().colorTheme, get().radius);
    set({ theme, resolvedTheme: resolved });
  },

  setColorTheme: (colorTheme) => {
    const nextPrefs: StoredPreferences = {
      colorTheme,
      radius: get().radius,
      navbarType: get().navbarType,
      footerType: get().footerType,
    };
    savePrefs(nextPrefs);
    applyThemeToDom(get().resolvedTheme, colorTheme, get().radius);
    set({ colorTheme });
  },

  setRadius: (radius) => {
    const nextPrefs: StoredPreferences = {
      colorTheme: get().colorTheme,
      radius,
      navbarType: get().navbarType,
      footerType: get().footerType,
    };
    savePrefs(nextPrefs);
    applyThemeToDom(get().resolvedTheme, get().colorTheme, radius);
    set({ radius });
  },

  setNavbarType: (navbarType) => {
    const nextPrefs: StoredPreferences = {
      colorTheme: get().colorTheme,
      radius: get().radius,
      navbarType,
      footerType: get().footerType,
    };
    savePrefs(nextPrefs);
    set({ navbarType });
  },

  setFooterType: (footerType) => {
    const nextPrefs: StoredPreferences = {
      colorTheme: get().colorTheme,
      radius: get().radius,
      navbarType: get().navbarType,
      footerType,
    };
    savePrefs(nextPrefs);
    set({ footerType });
  },

  resetPreferences: () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    }
    savePrefs(DEFAULT_PREFS);
    const resolved = resolveTheme("light");
    applyThemeToDom(resolved, DEFAULT_PREFS.colorTheme, DEFAULT_PREFS.radius);
    set({
      theme: "light",
      resolvedTheme: resolved,
      ...DEFAULT_PREFS,
    });
  },

  toggleTheme: () => {
    const currentResolved = get().resolvedTheme;
    const next: ThemeMode = currentResolved === "dark" ? "light" : "dark";
    get().setTheme(next);
  },

  syncFromSystem: () => {
    const current = get().theme;
    if (current !== "system") return;
    const resolved = getSystemTheme();
    applyThemeToDom(resolved, get().colorTheme, get().radius);
    set({ resolvedTheme: resolved });
  },
}));

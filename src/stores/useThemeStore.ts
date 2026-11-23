import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";
export type ColorThemeId =
  | "violet"
  | "blue"
  | "red"
  | "rose"
  | "orange"
  | "yellow"
  | "zinc"
  | "slate"
  | "stone"
  | "gray"
  | "neutral";
export type RadiusOption = 0 | 0.3 | 0.5 | 0.75 | 1;
export type NavbarType = "sticky" | "static" | "floating" | "hidden";
export type FooterType = "sticky" | "static" | "hidden";

export interface ColorThemeDefinition {
  id: ColorThemeId;
  label: string;
  lightPrimary: string;
  darkPrimary: string;
  lightForeground: string;
  darkForeground: string;
  lightRing: string;
  darkRing: string;
}

export const COLOR_THEMES: ColorThemeDefinition[] = [
  {
    id: "violet",
    label: "Violet",
    lightPrimary: "#846cf9",
    darkPrimary: "#6338f0",
    lightForeground: "#f5f5ff",
    darkForeground: "#f5f5ff",
    lightRing: "#7c3aed",
    darkRing: "#6d28d9",
  },
  {
    id: "blue",
    label: "Blue",
    lightPrimary: "#3b82f6",
    darkPrimary: "#2563eb",
    lightForeground: "#f8fafc",
    darkForeground: "#f8fafc",
    lightRing: "#3b82f6",
    darkRing: "#60a5fa",
  },
  {
    id: "red",
    label: "Red",
    lightPrimary: "#ef4444",
    darkPrimary: "#dc2626",
    lightForeground: "#fef2f2",
    darkForeground: "#fef2f2",
    lightRing: "#ef4444",
    darkRing: "#f87171",
  },
  {
    id: "rose",
    label: "Rose",
    lightPrimary: "#e11d48",
    darkPrimary: "#f43f5e",
    lightForeground: "#fff1f2",
    darkForeground: "#fff1f2",
    lightRing: "#e11d48",
    darkRing: "#fb7185",
  },
  {
    id: "orange",
    label: "Orange",
    lightPrimary: "#f97316",
    darkPrimary: "#ea580c",
    lightForeground: "#fff7ed",
    darkForeground: "#fff7ed",
    lightRing: "#f97316",
    darkRing: "#fb923c",
  },
  {
    id: "yellow",
    label: "Yellow",
    lightPrimary: "#eab308",
    darkPrimary: "#ca8a04",
    lightForeground: "#1e293b",
    darkForeground: "#fefce8",
    lightRing: "#eab308",
    darkRing: "#facc15",
  },
  {
    id: "zinc",
    label: "Zinc",
    lightPrimary: "#18181b",
    darkPrimary: "#fafafa",
    lightForeground: "#fafafa",
    darkForeground: "#18181b",
    lightRing: "#18181b",
    darkRing: "#d4d4d8",
  },
  {
    id: "slate",
    label: "Slate",
    lightPrimary: "#0f172a",
    darkPrimary: "#f8fafc",
    lightForeground: "#f8fafc",
    darkForeground: "#0f172a",
    lightRing: "#0f172a",
    darkRing: "#cbd5e1",
  },
  {
    id: "stone",
    label: "Stone",
    lightPrimary: "#1c1917",
    darkPrimary: "#fafaf9",
    lightForeground: "#fafaf9",
    darkForeground: "#1c1917",
    lightRing: "#1c1917",
    darkRing: "#d6d3d1",
  },
  {
    id: "gray",
    label: "Gray",
    lightPrimary: "#111827",
    darkPrimary: "#f9fafb",
    lightForeground: "#f9fafb",
    darkForeground: "#111827",
    lightRing: "#111827",
    darkRing: "#d1d5db",
  },
  {
    id: "neutral",
    label: "Neutral",
    lightPrimary: "#171717",
    darkPrimary: "#fafafa",
    lightForeground: "#fafafa",
    darkForeground: "#171717",
    lightRing: "#171717",
    darkRing: "#d4d4d4",
  },
];

const THEME_STORAGE_KEY = "authcore-theme";
const PREFS_STORAGE_KEY = "authcore-theme-prefs";

interface StoredPreferences {
  colorTheme: ColorThemeId;
  radius: RadiusOption;
  navbarType: NavbarType;
  footerType: FooterType;
}

const DEFAULT_PREFS: StoredPreferences = {
  colorTheme: "violet",
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

function readInitialPrefs(): StoredPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    const validColor = COLOR_THEMES.some((c) => c.id === parsed.colorTheme)
      ? (parsed.colorTheme as ColorThemeId)
      : DEFAULT_PREFS.colorTheme;
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
  root.style.setProperty("--radius", `${radius}rem`);

  const palette =
    COLOR_THEMES.find((c) => c.id === colorTheme) ?? COLOR_THEMES[0];
  const isDark = resolved === "dark";
  root.style.setProperty(
    "--primary",
    isDark ? palette.darkPrimary : palette.lightPrimary
  );
  root.style.setProperty(
    "--primary-foreground",
    isDark ? palette.darkForeground : palette.lightForeground
  );
  root.style.setProperty(
    "--ring",
    isDark ? palette.darkRing : palette.lightRing
  );
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

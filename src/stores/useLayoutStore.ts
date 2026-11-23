import { create } from "zustand";

export type NavStyle = "modern" | "classic" | "horizontal";
export type SidebarType = "module" | "classic" | "popover";

interface LayoutStoreState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  navStyle: NavStyle;
  sidebarType: SidebarType;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setNavStyle: (style: NavStyle) => void;
  setSidebarType: (type: SidebarType) => void;
}

const NAV_STYLE_KEY = "authcore-nav-style";
const SIDEBAR_TYPE_KEY = "authcore-sidebar-type";

function readInitialNavStyle(): NavStyle {
  if (typeof window === "undefined") return "modern";
  const saved = window.localStorage.getItem(NAV_STYLE_KEY);
  if (saved === "modern" || saved === "classic" || saved === "horizontal") {
    return saved;
  }
  return "modern";
}

function readInitialSidebarType(): SidebarType {
  if (typeof window === "undefined") return "classic";
  const saved = window.localStorage.getItem(SIDEBAR_TYPE_KEY);
  if (saved === "module" || saved === "classic" || saved === "popover") {
    return saved;
  }
  return "classic";
}

export const useLayoutStore = create<LayoutStoreState>((set, get) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  navStyle: readInitialNavStyle(),
  sidebarType: readInitialSidebarType(),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () =>
    set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setNavStyle: (style) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NAV_STYLE_KEY, style);
    }
    set({ navStyle: style });
  },
  setSidebarType: (type) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_TYPE_KEY, type);
    }
    set({
      sidebarType: type,
      sidebarCollapsed: type === "popover" ? true : false,
    });
  },
}));

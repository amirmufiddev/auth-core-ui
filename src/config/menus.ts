import {
  Activity,
  Building2,
  KeyRound,
  LayoutDashboard,
  type LucideIcon,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";
import { type BetterAuthFeatureId } from "@/config/better-auth.config";

export interface MenuItemProps {
  title: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  featureId?: BetterAuthFeatureId;
  isHeader?: boolean;
  child?: MenuItemProps[];
}

const applicationItems: MenuItemProps[] = [
  {
    title: "Users",
    href: "/users",
    icon: Users,
    featureId: "admin",
  },
  {
    title: "Roles & RBAC",
    href: "/roles",
    icon: ShieldCheck,
    featureId: "admin",
  },
  {
    title: "Organizations",
    href: "/organizations",
    icon: Building2,
    featureId: "organization",
  },
  {
    title: "Sessions & Devices",
    href: "/sessions",
    icon: Activity,
    featureId: "sessionManagement",
  },
  {
    title: "API Keys & OAuth",
    href: "/api-keys",
    icon: KeyRound,
    featureId: "apiKey",
  },
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: ScrollText,
    featureId: "auditLogs",
  },
  {
    title: "Auth Features",
    href: "/auth-features",
    icon: SlidersHorizontal,
    badge: "Service",
  },
  {
    title: "Account Settings",
    href: "/account",
    icon: UserCog,
  },
];

export const menusConfig: {
  mainNav: MenuItemProps[];
  sidebarNav: {
    modern: MenuItemProps[];
    classic: MenuItemProps[];
  };
} = {
  mainNav: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      child: [
        {
          title: "Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Application",
      icon: ShieldCheck,
      child: applicationItems,
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        child: [
          {
            title: "Overview",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
        ],
      },
      {
        title: "Application",
        icon: ShieldCheck,
        child: applicationItems,
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        isHeader: true,
        title: "Application",
        icon: ShieldCheck,
      },
      ...applicationItems,
    ],
  },
};

export function collectMenuHrefs(items: MenuItemProps[]): string[] {
  const hrefs: string[] = [];
  for (const item of items) {
    if (item.href) hrefs.push(item.href);
    if (item.child?.length) {
      hrefs.push(...collectMenuHrefs(item.child));
    }
  }
  return hrefs;
}

import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { menusConfig, type MenuItemProps } from "@/config/menus";
import { cn, isLocationMatch } from "@/lib/utils";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { AppLogo } from "@/components/layout/AppLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SidebarMenuContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navStyle = useLayoutStore((s) => s.navStyle);
  const features = useAuthConfigStore((s) => s.features);

  const items: MenuItemProps[] =
    navStyle === "classic"
      ? menusConfig.sidebarNav.classic
      : menusConfig.sidebarNav.modern;

  const renderLeafLink = (item: MenuItemProps) => {
    if (!item.href) return null;
    const Icon = item.icon;
    const active = isLocationMatch(item.href, pathname);
    const featureEnabled = item.featureId
      ? Boolean(features[item.featureId]?.enabled)
      : true;

    const linkContent = (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        {active && !collapsed && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
        )}
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            active
              ? "text-primary"
              : "text-muted-foreground group-hover:text-primary"
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {!featureEnabled ? (
              <Badge
                color="warning"
                variant="soft"
                className="px-1.5 py-0 text-[10px]"
              >
                <Lock className="mr-1 h-2.5 w-2.5" />
                Off
              </Badge>
            ) : item.badge ? (
              <Badge
                color={active ? "tertiary" : "default"}
                variant="soft"
                className="px-1.5 py-0 text-[10px]"
              >
                {item.badge}
              </Badge>
            ) : null}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">
            <span>{item.title}</span>
            {!featureEnabled && " (Non-Aktif)"}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.href}>{linkContent}</div>;
  };

  return (
    <TooltipProvider delayDuration={150}>
      <nav className="space-y-4 px-3 py-4">
        {items.map((entry, idx) => {
          if (entry.isHeader) {
            if (collapsed) return null;
            return (
              <div
                key={`hdr-${idx}`}
                className="px-3 pt-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                {entry.title}
              </div>
            );
          }

          if (entry.child?.length) {
            return (
              <div key={`grp-${entry.title}`} className="space-y-1.5">
                {!collapsed && (
                  <div className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {entry.title}
                  </div>
                )}
                <div className="space-y-1">
                  {entry.child.map((child) => renderLeafLink(child))}
                </div>
              </div>
            );
          }

          return renderLeafLink(entry);
        })}
      </nav>
    </TooltipProvider>
  );
}

export function AppSidebar() {
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useLayoutStore(
    (s) => s.toggleSidebarCollapsed
  );
  const mobileSidebarOpen = useLayoutStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useLayoutStore((s) => s.setMobileSidebarOpen);
  const navStyle = useLayoutStore((s) => s.navStyle);
  const sidebarType = useLayoutStore((s) => s.sidebarType);
  const isCollapsed = sidebarCollapsed || sidebarType === "popover";

  if (navStyle === "horizontal") {
    return (
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle className="flex items-center gap-2 text-base">
              <AppLogo showText subtitle="Centralized IAM" size="sm" />
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-4.5rem)]">
            <SidebarMenuContent
              collapsed={false}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:flex lg:flex-col",
          isCollapsed ? "w-18.5" : sidebarType === "module" ? "w-72" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-sidebar-border px-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <AppLogo
              showText={!isCollapsed}
              subtitle="Centralized IAM System"
              size="md"
            />
          </Link>

          {!isCollapsed && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              color="secondary"
              className="h-8 w-8"
              onClick={toggleSidebarCollapsed}
              aria-label="Perkecil sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <SidebarMenuContent collapsed={isCollapsed} />
        </ScrollArea>

        {isCollapsed && (
          <div className="flex shrink-0 justify-center border-t border-border p-3">
            <Button
              type="button"
              size="icon"
              variant="outline"
              color="secondary"
              className="h-8 w-8"
              onClick={toggleSidebarCollapsed}
              aria-label="Perluas sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </aside>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle className="flex items-center gap-2 text-base">
              <AppLogo showText subtitle="Centralized IAM" size="sm" />
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-4.5rem)]">
            <SidebarMenuContent
              collapsed={false}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

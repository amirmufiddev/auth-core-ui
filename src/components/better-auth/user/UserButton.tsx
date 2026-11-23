import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  LogOut,
  Settings,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { UserAvatar } from "@/components/better-auth/user/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface UserButtonLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface UserButtonProps {
  size?: "default" | "icon";
  align?: "start" | "center" | "end";
  hideSettings?: boolean;
  additionalLinks?: UserButtonLink[];
}

export function UserButton({
  size = "default",
  align = "end",
  hideSettings = false,
  additionalLinks = [],
}: UserButtonProps) {
  const { basePaths, localization, navigate } = useAuthUI();
  const user = useAuthStore((s) => s.user);
  const deviceAccounts = useAuthStore((s) => s.deviceAccounts);
  const switchDeviceAccount = useAuthStore((s) => s.switchDeviceAccount);
  const signOut = useAuthStore((s) => s.signOut);

  const isMultiSessionEnabled = useAuthConfigStore((s) =>
    s.isFeatureEnabled("multiSession")
  );

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesi diakhiri.");
    navigate(basePaths.signIn);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {size === "icon" ? (
          <Button
            type="button"
            variant="ghost"
            color="secondary"
            size="icon"
            className="h-9 w-9 rounded-full p-0"
            aria-label="Menu pengguna"
          >
            <UserAvatar user={user} size="sm" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            color="secondary"
            className="h-10 gap-2.5 px-2 hover:bg-accent"
          >
            <UserAvatar user={user} size="sm" />
            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold leading-tight text-default-900">
                {user.name}
              </div>
              <div className="text-[11px] leading-tight text-muted-foreground">
                {user.role}
              </div>
            </div>
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold text-default-900">
              {user.name}
            </span>
            <Badge color="default" variant="soft" className="font-mono text-[10px]">
              {user.role}
            </Badge>
          </div>
          <div className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!hideSettings && (
          <DropdownMenuItem asChild>
            <Link to={basePaths.account} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>{localization.accountSettingsLabel}</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link to={basePaths.authFeatures} className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Auth Features Config</span>
          </Link>
        </DropdownMenuItem>

        {additionalLinks.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link to={link.href} className="flex items-center gap-2">
              {link.icon}
              <span>{link.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        {isMultiSessionEnabled && deviceAccounts.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              Multi-Session Switcher
            </DropdownMenuLabel>
            {deviceAccounts.map((acc) => (
              <DropdownMenuItem
                key={acc.id}
                onClick={() => {
                  switchDeviceAccount(acc.id);
                  toast.success(`Beralih sesi ke ${acc.email}`);
                }}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2 truncate">
                  <UserCheck className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-xs">{acc.email}</span>
                </span>
                {acc.id === user.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{localization.signOutLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

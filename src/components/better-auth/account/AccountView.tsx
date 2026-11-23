import { KeyRound, Laptop, Palette, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChangeEmailCard,
  UpdateAvatarCard,
  UpdateNameCard,
} from "@/components/better-auth/account/ProfileCards";
import {
  ChangePasswordCard,
  DeleteAccountCard,
  PasskeysCard,
  ProvidersCard,
  TwoFactorCard,
} from "@/components/better-auth/account/SecurityCards";
import {
  ApiKeysCard,
  SessionsCard,
} from "@/components/better-auth/account/SessionsAndKeysCards";
import { ThemePreferencesCard } from "@/components/better-auth/account/ThemePreferencesCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type AccountViewTab =
  "profile" | "security" | "sessions" | "api-keys" | "preferences";

export interface AccountViewProps {
  activeTab: AccountViewTab;
  onTabChange: (tab: AccountViewTab) => void;
}

const ACCOUNT_NAV_ITEMS: Array<{
  id: AccountViewTab;
  label: string;
  description: string;
  icon: typeof User;
}> = [
  {
    id: "profile",
    label: "Profile",
    description: "Avatar, nama, username & email",
    icon: User,
  },
  {
    id: "security",
    label: "Security",
    description: "Password, 2FA, Passkeys & OAuth",
    icon: ShieldCheck,
  },
  {
    id: "sessions",
    label: "Sessions",
    description: "Perangkat yang sedang login",
    icon: Laptop,
  },
  {
    id: "api-keys",
    label: "API Keys",
    description: "Token akses pribadi & CLI",
    icon: KeyRound,
  },
  {
    id: "preferences",
    label: "Theme Preferences",
    description: "Warna, layout, radius & navbar",
    icon: Palette,
  },
];

export function AccountView({ activeTab, onTabChange }: AccountViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="space-y-1 p-2">
            {ACCOUNT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={isActive ? undefined : "ghost"}
                  color={isActive ? "primary" : "secondary"}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "h-auto w-full justify-start gap-3 px-3 py-2.5 text-left",
                    !isActive &&
                      "text-default-700 hover:bg-accent hover:text-default-900",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-tight">
                      {item.label}
                    </div>
                    <div
                      className={cn(
                        "truncate text-[11px] font-normal",
                        isActive ? "text-primary-100" : "text-muted-foreground",
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5 lg:col-span-9">
        {activeTab === "profile" && (
          <>
            <UpdateAvatarCard />
            <UpdateNameCard />
            <ChangeEmailCard />
          </>
        )}

        {activeTab === "security" && (
          <>
            <ChangePasswordCard />
            <TwoFactorCard />
            <PasskeysCard />
            <ProvidersCard />
            <DeleteAccountCard />
          </>
        )}

        {activeTab === "sessions" && <SessionsCard />}

        {activeTab === "api-keys" && <ApiKeysCard />}

        {activeTab === "preferences" && <ThemePreferencesCard />}
      </div>
    </div>
  );
}

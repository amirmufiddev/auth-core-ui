import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { CheckCircle2, Moon, Shield, Sun } from "lucide-react";
import { BETTER_AUTH_FEATURES } from "@/config/better-auth.config";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function AuthLayoutComponent() {
  const features = useAuthConfigStore((s) => s.features);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const activeFeatures = BETTER_AUTH_FEATURES.filter(
    (f) => features[f.id]?.enabled
  );

  return (
    <div className="grid min-h-screen grid-cols-1 bg-page-bg lg:grid-cols-12">
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:col-span-5 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">AuthCore</div>
            <div className="text-xs text-primary-100">
              Configurable Better Auth Service
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Badge
              color="secondary"
              variant="soft"
              className="bg-white/15 text-primary-foreground"
            >
              {activeFeatures.length} / {BETTER_AUTH_FEATURES.length} Modul Aktif
            </Badge>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              Identity & Access Management terpusat dalam satu konsol.
            </h2>
            <p className="text-sm text-primary-100">
              Setiap metode login, RBAC, 2FA, Passkey, Multi-Tenant, dan API
              Key dapat diaktifkan atau dinonaktifkan secara dinamis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {activeFeatures.slice(0, 8).map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-primary-100">
          AuthCore Service Console · Powered by Better Auth & DashTail UI
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10 lg:col-span-7">
        <div className="absolute right-6 top-6">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle Light/Dark Mode"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-warning" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuthLayoutComponent,
});

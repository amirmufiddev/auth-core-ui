import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { CheckCircle2, Moon, Sun } from "lucide-react";
import { BETTER_AUTH_FEATURES } from "@/config/better-auth.config";
import { cn } from "@/lib/utils";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { COLOR_THEMES, useThemeStore } from "@/stores/useThemeStore";
import { AnimatedAuthBackground } from "@/components/auth/AnimatedAuthBackground";
import { AuthMascot } from "@/components/auth/AuthMascot";
import {
  AuthStageProvider,
  useAuthStage,
} from "@/components/auth/AuthStageContext";
import { AppLogo } from "@/components/layout/AppLogo";
import { Button } from "@/components/ui/button";

function AuthSplitShell() {
  const { stage } = useAuthStage();
  const features = useAuthConfigStore((s) => s.features);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const colorTheme = useThemeStore((s) => s.colorTheme);
  const setColorTheme = useThemeStore((s) => s.setColorTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const activeFeatures = BETTER_AUTH_FEATURES.filter(
    (f) => features[f.id]?.enabled,
  );

  return (
    <section className="relative flex min-h-screen w-full overflow-hidden p-3 sm:p-6 lg:p-8">
      {/* Live theme-synced animated silk-ribbon canvas behind entire viewport */}
      <AnimatedAuthBackground />

      {/* Framed 50/50 Split Container */}
      <div className="relative z-10 grid w-full grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-0">
        {/* Left Transparent Window Panel (Framed with border-card) */}
        <div className="relative flex min-h-70 flex-col justify-between gap-6 rounded-3xl border-[6px] border-card bg-transparent p-6 text-white sm:p-8 lg:min-h-150 lg:rounded-l-3xl lg:rounded-r-none lg:border-8 lg:p-10">
          {/* Top Eyebrow Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AppLogo
                forceDark
                showText
                subtitle="Centralized Identity & Access Management"
                size="md"
              />
            </div>
          </div>

          {/* Mascot Anchor (flies smoothly to Right Panel during OTP / 2FA / Verified) */}
          <div className="flex flex-1 items-end justify-start pt-4 pl-2">
            {stage === "default" && <AuthMascot size="lg" />}
          </div>

          {/* Bottom Quote & Active Feature Highlights */}
          <div className="space-y-4">
            <div className="space-y-2.5">
              <h2 className="max-w-lg text-3xl font-semibold leading-[1.18] tracking-tight text-white sm:text-4xl xl:text-[44px]">
                Identity Infrastructure, Made Effortless.
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-white/80">
                Kelola autentikasi, RBAC, OTP, 2FA, Passkey, dan multi-tenant
                secara terpusat dan terintegrasi.
              </p>
            </div>

            <div className="hidden flex-wrap gap-2 pt-1 sm:flex">
              {activeFeatures.slice(0, 4).map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-3 w-3 text-tertiary" />
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Solid Card Panel (100% synced to active Tailwind color theme) */}
        <div className="relative flex flex-col items-center justify-between gap-6 rounded-3xl bg-card p-6 text-card-foreground sm:p-10 lg:rounded-l-none lg:rounded-r-3xl lg:px-14 lg:py-8">
          {/* Top-right Theme Palette & Dark/Light Switcher */}
          <div className="flex w-full items-center justify-end gap-2">
            <div
              className="flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-2 py-1"
              aria-label="Pilih palet tema"
            >
              {COLOR_THEMES.slice(0, 6).map((palette) => {
                const active = colorTheme === palette.id;
                const dotColor = palette.swatches[resolvedTheme][0];
                return (
                  <button
                    key={palette.id}
                    type="button"
                    title={palette.label}
                    aria-label={`Tema ${palette.label}`}
                    onClick={() => setColorTheme(palette.id)}
                    className={cn(
                      "h-4 w-4 cursor-pointer rounded-full transition-transform hover:scale-110",
                      active
                        ? "scale-110 ring-2 ring-foreground ring-offset-1 ring-offset-card"
                        : "opacity-75 hover:opacity-100",
                    )}
                    style={{ backgroundColor: dotColor }}
                  />
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={toggleTheme}
              aria-label="Toggle Light/Dark Mode"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-warning" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Main Centered Auth Stage */}
          <div className="relative flex w-full flex-1 flex-col items-center justify-center py-2">
            <Outlet />
          </div>

          {/* Subtle Brand Footer */}
          <p className="text-center text-[11px] text-muted-foreground">
            Auth Core Service Console · Enterprise Identity UI
          </p>
        </div>
      </div>
    </section>
  );
}

function AuthLayoutComponent() {
  return (
    <AuthStageProvider>
      <AuthSplitShell />
    </AuthStageProvider>
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

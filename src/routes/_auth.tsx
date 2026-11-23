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
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-12">
      {/* Left Showcase Panel (Dark Minimalist with Soft Wave) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#09090B] p-10 text-white lg:col-span-5 lg:flex">
        {/* Soft Abstract Gradient Glow & Wave */}
        <svg
          aria-hidden="true"
          viewBox="0 0 600 800"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="authWaveA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F472B6" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            d="M-40,760 C160,560 220,380 420,260 C540,185 580,80 620,-20"
            fill="none"
            stroke="url(#authWaveA)"
            strokeWidth="1.5"
          />
          <path
            d="M-20,800 C180,590 250,410 440,290 C560,210 595,110 635,10"
            fill="none"
            stroke="url(#authWaveA)"
            strokeWidth="1.2"
          />
          <path
            d="M10,830 C205,620 280,440 465,320 C580,240 610,145 645,45"
            fill="none"
            stroke="url(#authWaveA)"
            strokeWidth="1"
          />
          <path
            d="M45,860 C235,650 310,475 495,355 C600,275 625,180 660,80"
            fill="none"
            stroke="url(#authWaveA)"
            strokeWidth="0.9"
          />
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-[0.18em] text-zinc-300 uppercase">
              AuthCore Identity
            </span>
            <span className="h-px w-10 bg-white/25" />
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <Badge
              color="secondary"
              variant="soft"
              className="border border-white/15 bg-white/10 text-zinc-100"
            >
              {activeFeatures.length} / {BETTER_AUTH_FEATURES.length} Modul Aktif
            </Badge>
            <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight text-white">
              Identity Infrastructure, Made Effortless.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              Kelola autentikasi, RBAC, 2FA, Passkey, dan multi-tenant secara
              terpusat dan configurable berbasis Better Auth.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {activeFeatures.slice(0, 6).map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-xs text-zinc-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          AuthCore Service Console · Better Auth Framework
        </div>
      </div>

      {/* Right Clean Form Area */}
      <div className="relative flex flex-col items-center justify-center bg-background p-6 sm:p-10 lg:col-span-7">
        <div className="absolute right-6 top-6">
          <Button
            type="button"
            variant="outline"
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

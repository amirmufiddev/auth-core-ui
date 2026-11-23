import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  type LoginEmailValues,
  loginEmailSchema,
} from "@/features/auth/schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export interface SignInFormProps {
  redirectTo?: string;
  showDemoButton?: boolean;
}

export function SignInForm({
  redirectTo = "/dashboard",
  showDemoButton = true,
}: SignInFormProps) {
  const { features, basePaths, navigate } = useAuthUI();
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const emailEnabled = Boolean(features.emailAndPassword?.enabled);
  const usernameEnabled = Boolean(features.username?.enabled);
  const captchaEnabled = Boolean(features.captcha?.enabled);

  const form = useForm<LoginEmailValues>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: {
      identifier: "admin@authcore.io",
      password: "password123",
    },
  });

  if (!emailEnabled) {
    return null;
  }

  const handleSuccess = async () => {
    toast.success("Berhasil masuk ke Auth Core.");
    navigate(redirectTo || "/dashboard");
  };

  const onSubmit = async (vals: LoginEmailValues) => {
    try {
      const mode =
        !vals.identifier.includes("@") && usernameEnabled
          ? "username"
          : "email";
      const res = await signInWithEmail({
        identifier: vals.identifier,
        password: vals.password,
        mode,
      });
      if (res.requires2FA) {
        toast.info("Masukkan kode verifikasi 2FA Anda.");
        navigate(basePaths.twoFactor);
        return;
      }
      await handleSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login gagal.");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="ba-signin-id"
            className="text-xs font-medium text-foreground"
          >
            {usernameEnabled ? "Email atau Username" : "Email"}
          </Label>
          <Input
            id="ba-signin-id"
            className="h-11 rounded-lg border-border/60 bg-surface-subtle focus-visible:bg-card"
            placeholder={
              usernameEnabled
                ? "admin@authcore.io atau rakapratama"
                : "admin@authcore.io"
            }
            {...form.register("identifier")}
          />
          {form.formState.errors.identifier && (
            <p className="text-xs text-destructive">
              {form.formState.errors.identifier.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="ba-signin-pass"
            className="text-xs font-medium text-foreground"
          >
            Kata Sandi
          </Label>
          <div className="relative">
            <Input
              id="ba-signin-pass"
              type={showPassword ? "text" : "password"}
              className="h-11 rounded-lg border-border/60 bg-surface-subtle pr-10 focus-visible:bg-card"
              {...form.register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              color="secondary"
              size="icon"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-md text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="ba-signin-remember"
            className="flex cursor-pointer items-center gap-2 text-muted-foreground"
          >
            <Checkbox
              id="ba-signin-remember"
              checked={rememberMe}
              onCheckedChange={(val) => setRememberMe(Boolean(val))}
            />
            <span>Ingat saya</span>
          </label>
          <Link
            to={basePaths.forgotPassword}
            className="font-semibold text-primary hover:underline"
          >
            Lupa password?
          </Link>
        </div>

        {captchaEnabled && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary-soft/60 px-3 py-2 text-xs text-primary-soft-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Captcha Protection aktif (
              {String(
                features.captcha?.settings.provider ?? "cloudflare-turnstile",
              )}
              )
            </span>
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          <Button
            type="submit"
            color="primary"
            className="h-11 w-full rounded-lg text-sm font-semibold"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Memproses..." : "Masuk"}
          </Button>

          {showDemoButton && (
            <Button
              type="button"
              variant="soft"
              color="tertiary"
              className="h-11 w-full rounded-lg text-sm font-semibold"
              onClick={async () => {
                await signInWithEmail({
                  identifier: "admin@authcore.io",
                  password: "password123",
                  mode: "email",
                });
                await handleSuccess();
              }}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Masuk Cepat (Demo Super Admin)
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

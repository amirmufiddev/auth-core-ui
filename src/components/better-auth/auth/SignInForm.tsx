import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  type LoginEmailValues,
  loginEmailSchema,
} from "@/features/auth/schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

  const usernameEnabled = Boolean(features.username?.enabled);
  const captchaEnabled = Boolean(features.captcha?.enabled);

  const form = useForm<LoginEmailValues>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: {
      identifier: "admin@authcore.io",
      password: "password123",
    },
  });

  const handleSuccess = async () => {
    toast.success("Berhasil masuk ke AuthCore.");
    navigate(redirectTo || "/dashboard");
  };

  const onSubmit = async (vals: LoginEmailValues) => {
    try {
      const mode =
        !vals.identifier.includes("@") && usernameEnabled ? "username" : "email";
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
          <Label htmlFor="ba-signin-id">
            {usernameEnabled ? "Email atau Username" : "Email"}
          </Label>
          <Input
            id="ba-signin-id"
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
          <div className="flex items-center justify-between">
            <Label htmlFor="ba-signin-pass">Kata Sandi</Label>
            <Link
              to={basePaths.forgotPassword}
              className="text-xs font-medium text-primary hover:underline"
            >
              Lupa password?
            </Link>
          </div>
          <Input
            id="ba-signin-pass"
            type="password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {captchaEnabled && (
          <Alert color="info">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs">
              Captcha Protection aktif (
              {String(
                features.captcha?.settings.provider ?? "cloudflare-turnstile"
              )}
              ).
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          color="primary"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      {showDemoButton && (
        <Button
          type="button"
          variant="outline"
          color="primary"
          className="w-full"
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
          Masuk Cepat sebagai Demo Super Admin
        </Button>
      )}
    </div>
  );
}

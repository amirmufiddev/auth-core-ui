import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { EmailOTPForm } from "@/components/better-auth/auth/EmailOTPForm";
import { ForgotPasswordForm } from "@/components/better-auth/auth/ForgotPasswordForm";
import { MagicLinkForm } from "@/components/better-auth/auth/MagicLinkForm";
import { PasskeyButton } from "@/components/better-auth/auth/PasskeyButton";
import {
  ProviderButtons,
  SOCIAL_PROVIDER_CATALOG,
} from "@/components/better-auth/auth/ProviderButtons";
import { SignInForm } from "@/components/better-auth/auth/SignInForm";
import { SignUpForm } from "@/components/better-auth/auth/SignUpForm";
import { TwoFactorForm } from "@/components/better-auth/auth/TwoFactorForm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AuthViewType =
  | "SIGN_IN"
  | "SIGN_UP"
  | "FORGOT_PASSWORD"
  | "TWO_FACTOR"
  | "MAGIC_LINK"
  | "EMAIL_OTP";

export interface AuthViewProps {
  view?: AuthViewType;
  redirectTo?: string;
  className?: string;
}

export function AuthView({
  view = "SIGN_IN",
  redirectTo = "/dashboard",
  className,
}: AuthViewProps) {
  const { features, basePaths, localization } = useAuthUI();
  const lastLoginMethod = useAuthStore((s) => s.lastLoginMethod);
  const pending2FA = useAuthStore((s) => s.pending2FA);

  const emailEnabled = Boolean(features.emailAndPassword?.enabled);
  const usernameEnabled = Boolean(features.username?.enabled);
  const magicLinkEnabled = Boolean(features.magicLink?.enabled);
  const emailOtpEnabled = Boolean(features.emailOTP?.enabled);
  const phoneOtpEnabled = Boolean(features.phoneNumber?.enabled);
  const passkeyEnabled = Boolean(features.passkey?.enabled);
  const lastLoginEnabled = Boolean(features.lastLoginMethod?.enabled);

  const hasAlternativeProviders =
    passkeyEnabled ||
    Boolean(features.oneTap?.enabled) ||
    Boolean(features.siwe?.enabled) ||
    Boolean(features.anonymous?.enabled) ||
    SOCIAL_PROVIDER_CATALOG.some((s) => features[s.id]?.enabled);

  if (view === "SIGN_UP") {
    return (
      <Card className={`w-full max-w-md border border-border ${className ?? ""}`}>
        <CardHeader className="mb-0">
          <CardTitle className="text-xl font-semibold">
            {localization.signUpTitle}
          </CardTitle>
          <CardDescription>{localization.signUpDescription}</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <SignUpForm redirectTo={redirectTo} />
        </CardContent>
        <CardFooter className="justify-center border-t border-border pt-4 text-xs text-muted-foreground">
          Sudah memiliki akun?
          <Link
            to={basePaths.signIn}
            className="ml-1 font-semibold text-primary hover:underline"
          >
            Masuk
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (view === "FORGOT_PASSWORD") {
    return (
      <Card className={`w-full max-w-md border border-border ${className ?? ""}`}>
        <CardHeader className="mb-0">
          <CardTitle className="text-xl font-semibold">
            {localization.forgotPasswordTitle}
          </CardTitle>
          <CardDescription>
            {localization.forgotPasswordDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter className="justify-center border-t border-border pt-4 text-xs">
          <Link
            to={basePaths.signIn}
            className="font-semibold text-primary hover:underline"
          >
            Kembali ke halaman Login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (view === "TWO_FACTOR") {
    return (
      <Card className={`w-full max-w-md border border-border ${className ?? ""}`}>
        <CardHeader className="mb-0">
          <CardTitle className="text-xl font-semibold">
            {localization.twoFactorTitle}
          </CardTitle>
          <CardDescription>
            {pending2FA
              ? `Masukkan kode TOTP 6 digit untuk ${pending2FA.email}`
              : localization.twoFactorDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <TwoFactorForm redirectTo={redirectTo} />
        </CardContent>
        <CardFooter className="justify-center border-t border-border pt-4 text-xs">
          <Link
            to={basePaths.signIn}
            className="font-semibold text-primary hover:underline"
          >
            Gunakan akun lain
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const defaultTab =
    view === "MAGIC_LINK" && magicLinkEnabled
      ? "magic-link"
      : view === "EMAIL_OTP" && (emailOtpEnabled || phoneOtpEnabled)
        ? "otp"
        : emailEnabled || usernameEnabled
          ? "password"
          : magicLinkEnabled
            ? "magic-link"
            : "otp";

  return (
    <Card className={`w-full max-w-md border border-border ${className ?? ""}`}>
      <CardHeader className="mb-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl font-semibold">
            {localization.signInTitle}
          </CardTitle>
          {lastLoginEnabled && lastLoginMethod && (
            <Badge color="info" variant="soft" className="text-[11px]">
              Terakhir: {lastLoginMethod}
            </Badge>
          )}
        </div>
        <CardDescription>{localization.signInDescription}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full">
            {(emailEnabled || usernameEnabled) && (
              <TabsTrigger value="password" className="flex-1">
                Password
              </TabsTrigger>
            )}
            {magicLinkEnabled && (
              <TabsTrigger value="magic-link" className="flex-1">
                Magic Link
              </TabsTrigger>
            )}
            {(emailOtpEnabled || phoneOtpEnabled) && (
              <TabsTrigger value="otp" className="flex-1">
                OTP
              </TabsTrigger>
            )}
          </TabsList>

          {(emailEnabled || usernameEnabled) && (
            <TabsContent value="password" className="pt-4">
              <SignInForm redirectTo={redirectTo} />
            </TabsContent>
          )}

          {magicLinkEnabled && (
            <TabsContent value="magic-link" className="pt-4">
              <MagicLinkForm redirectTo={redirectTo} />
            </TabsContent>
          )}

          {(emailOtpEnabled || phoneOtpEnabled) && (
            <TabsContent value="otp" className="pt-4">
              <EmailOTPForm redirectTo={redirectTo} />
            </TabsContent>
          )}
        </Tabs>

        {hasAlternativeProviders && (
          <>
            <div className="relative flex items-center justify-center">
              <Separator />
              <span className="absolute bg-card px-2 text-[11px] text-muted-foreground">
                Atau lanjutkan dengan
              </span>
            </div>

            <div className="space-y-2">
              <PasskeyButton redirectTo={redirectTo} />
              <ProviderButtons redirectTo={redirectTo} />
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-border pt-4 text-xs text-muted-foreground">
        Belum punya akun?
        <Link
          to={basePaths.signUp}
          className="ml-1 font-semibold text-primary hover:underline"
        >
          Daftar sekarang
        </Link>
      </CardFooter>
    </Card>
  );
}

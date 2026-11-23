import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { AppLogo } from "@/components/layout/AppLogo";
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
  const [otpFocusedMode, setOtpFocusedMode] = useState(false);

  const emailEnabled = Boolean(features.emailAndPassword?.enabled);
  const magicLinkEnabled = Boolean(features.magicLink?.enabled);
  const emailOtpEnabled = Boolean(features.emailOTP?.enabled);
  const phoneOtpEnabled = Boolean(features.phoneNumber?.enabled);
  const passkeyEnabled = Boolean(features.passkey?.enabled);
  const lastLoginEnabled = Boolean(features.lastLoginMethod?.enabled);
  const hasOtp = emailOtpEnabled || phoneOtpEnabled;
  const hasAnyTab = emailEnabled || hasOtp || magicLinkEnabled;

  const hasAlternativeProviders =
    passkeyEnabled ||
    Boolean(features.oneTap?.enabled) ||
    Boolean(features.siwe?.enabled) ||
    Boolean(features.anonymous?.enabled) ||
    SOCIAL_PROVIDER_CATALOG.some((s) => features[s.id]?.enabled);

  if (view === "SIGN_UP") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`w-full max-w-sm space-y-6 ${className ?? ""}`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <AppLogo size="lg" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              {localization.signUpTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {localization.signUpDescription}
            </p>
          </div>
        </div>

        {emailEnabled ? (
          <SignUpForm redirectTo={redirectTo} />
        ) : (
          <div className="rounded-xl border border-warning/30 bg-warning-soft/70 p-4 text-center text-xs text-foreground">
            Fitur <span className="font-semibold">Email &amp; Password</span>{" "}
            sedang dinonaktifkan di Auth Core. Silakan masuk menggunakan metode
            autentikasi lain yang aktif (OTP, Magic Link, Passkey, atau Social
            OAuth).
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link
            to={basePaths.signIn}
            className="font-semibold text-primary hover:underline"
          >
            Masuk
          </Link>
        </p>
      </motion.div>
    );
  }

  if (view === "FORGOT_PASSWORD") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`w-full max-w-sm space-y-6 ${className ?? ""}`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <AppLogo size="lg" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              {localization.forgotPasswordTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {localization.forgotPasswordDescription}
            </p>
          </div>
        </div>

        {emailEnabled ? (
          <ForgotPasswordForm />
        ) : (
          <div className="rounded-xl border border-warning/30 bg-warning-soft/70 p-4 text-center text-xs text-foreground">
            Fitur <span className="font-semibold">Email &amp; Password</span>{" "}
            sedang dinonaktifkan, sehingga reset kata sandi tidak tersedia.
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Link
            to={basePaths.signIn}
            className="font-semibold text-primary hover:underline"
          >
            Kembali ke halaman Login
          </Link>
        </p>
      </motion.div>
    );
  }

  if (view === "TWO_FACTOR") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`w-full max-w-sm space-y-6 ${className ?? ""}`}
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
            {localization.twoFactorTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pending2FA
              ? `Masukkan kode TOTP 6 digit untuk ${pending2FA.email}`
              : localization.twoFactorDescription}
          </p>
        </div>

        <TwoFactorForm redirectTo={redirectTo} />

        <p className="text-center text-xs text-muted-foreground">
          <Link
            to={basePaths.signIn}
            className="font-semibold text-primary hover:underline"
          >
            Gunakan akun lain
          </Link>
        </p>
      </motion.div>
    );
  }

  const defaultTab =
    view === "MAGIC_LINK" && magicLinkEnabled
      ? "magic-link"
      : view === "EMAIL_OTP" && hasOtp
        ? "otp"
        : emailEnabled
          ? "password"
          : hasOtp
            ? "otp"
            : "magic-link";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`w-full max-w-sm space-y-6 ${className ?? ""}`}
    >
      {/* Hide standard header when OTP Verification or Verified stage takes over the center */}
      <AnimatePresence initial={false}>
        {!otpFocusedMode && (
          <motion.div
            key="signin-header"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <AppLogo size="lg" />
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
                  {localization.signInTitle}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                {localization.signInDescription}
              </p>
              {lastLoginEnabled && lastLoginMethod && (
                <div className="pt-1">
                  <Badge
                    color="tertiary"
                    variant="soft"
                    className="text-[11px]"
                  >
                    Terakhir masuk: {lastLoginMethod}
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {hasAnyTab && (
          <Tabs
            key={defaultTab}
            defaultValue={defaultTab}
            onValueChange={() => setOtpFocusedMode(false)}
          >
            {!otpFocusedMode && (
              <TabsList className="w-full rounded-xl bg-surface-subtle p-1">
                {emailEnabled && (
                  <TabsTrigger
                    value="password"
                    className="flex-1 rounded-lg text-xs"
                  >
                    Password
                  </TabsTrigger>
                )}
                {hasOtp && (
                  <TabsTrigger
                    value="otp"
                    className="flex-1 rounded-lg text-xs"
                  >
                    OTP
                  </TabsTrigger>
                )}
                {magicLinkEnabled && (
                  <TabsTrigger
                    value="magic-link"
                    className="flex-1 rounded-lg text-xs"
                  >
                    Magic Link
                  </TabsTrigger>
                )}
              </TabsList>
            )}

            {emailEnabled && (
              <TabsContent value="password" className="pt-4">
                <SignInForm redirectTo={redirectTo} />
              </TabsContent>
            )}

            {hasOtp && (
              <TabsContent
                value="otp"
                className={otpFocusedMode ? "pt-0" : "pt-4"}
              >
                <EmailOTPForm
                  redirectTo={redirectTo}
                  onStepChange={(step) => setOtpFocusedMode(step !== "request")}
                />
              </TabsContent>
            )}

            {magicLinkEnabled && (
              <TabsContent value="magic-link" className="pt-4">
                <MagicLinkForm redirectTo={redirectTo} />
              </TabsContent>
            )}
          </Tabs>
        )}

        {hasAlternativeProviders && !otpFocusedMode && (
          <>
            {hasAnyTab && (
              <div className="relative flex items-center justify-center">
                <Separator />
                <span className="absolute bg-card px-2.5 text-[11px] text-muted-foreground">
                  Atau lanjutkan dengan
                </span>
              </div>
            )}

            <div className="space-y-2">
              <PasskeyButton redirectTo={redirectTo} />
              <ProviderButtons redirectTo={redirectTo} />
            </div>
          </>
        )}

        {!hasAnyTab && !hasAlternativeProviders && (
          <div className="rounded-xl border border-warning/30 bg-warning-soft/70 p-4 text-center text-xs text-foreground">
            Tidak ada metode autentikasi yang aktif di Auth Core. Aktifkan
            minimal satu metode login melalui konfigurasi fitur.
          </div>
        )}
      </div>

      {!otpFocusedMode && emailEnabled && (
        <p className="text-center text-xs text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            to={basePaths.signUp}
            className="font-semibold text-primary hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      )}
    </motion.div>
  );
}

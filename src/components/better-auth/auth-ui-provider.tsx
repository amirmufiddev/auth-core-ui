import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { type authClient as defaultAuthClient } from "@/lib/auth-client";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { type FeatureConfigMap } from "@/config/better-auth.config";

export interface AuthUIBasePaths {
  signIn: string;
  signUp: string;
  forgotPassword: string;
  twoFactor: string;
  account: string;
  organizations: string;
  authFeatures: string;
}

export interface AuthUILocalization {
  signInTitle: string;
  signInDescription: string;
  signUpTitle: string;
  signUpDescription: string;
  forgotPasswordTitle: string;
  forgotPasswordDescription: string;
  twoFactorTitle: string;
  twoFactorDescription: string;
  signOutLabel: string;
  accountSettingsLabel: string;
}

const DEFAULT_BASE_PATHS: AuthUIBasePaths = {
  signIn: "/login",
  signUp: "/register",
  forgotPassword: "/forgot-password",
  twoFactor: "/verify-2fa",
  account: "/account",
  organizations: "/organizations",
  authFeatures: "/auth-features",
};

const DEFAULT_LOCALIZATION: AuthUILocalization = {
  signInTitle: "Masuk ke AuthCore",
  signInDescription:
    "UI autentikasi otomatis menyesuaikan plugin Better Auth yang aktif.",
  signUpTitle: "Buat Akun AuthCore",
  signUpDescription:
    "Registrasi akun baru terhubung dengan kebijakan keamanan Better Auth.",
  forgotPasswordTitle: "Reset Kata Sandi",
  forgotPasswordDescription:
    "Masukkan email terdaftar untuk menerima tautan pemulihan Better Auth.",
  twoFactorTitle: "Verifikasi Two-Factor (2FA)",
  twoFactorDescription:
    "Masukkan kode TOTP 6 digit atau backup recovery code Anda.",
  signOutLabel: "Keluar",
  accountSettingsLabel: "Account Settings",
};

export interface AuthUIContextValue {
  authClient: typeof defaultAuthClient;
  basePaths: AuthUIBasePaths;
  localization: AuthUILocalization;
  features: FeatureConfigMap;
  navigate: (to: string) => void;
}

const AuthUIContext = React.createContext<AuthUIContextValue | null>(null);

export interface AuthUIProviderProps {
  authClient: typeof defaultAuthClient;
  basePaths?: Partial<AuthUIBasePaths>;
  localization?: Partial<AuthUILocalization>;
  children: React.ReactNode;
}

export function AuthUIProvider({
  authClient,
  basePaths,
  localization,
  children,
}: AuthUIProviderProps) {
  const routerNavigate = useNavigate();
  const features = useAuthConfigStore((s) => s.features);

  const value = React.useMemo<AuthUIContextValue>(
    () => ({
      authClient,
      basePaths: { ...DEFAULT_BASE_PATHS, ...basePaths },
      localization: { ...DEFAULT_LOCALIZATION, ...localization },
      features,
      navigate: (to: string) => {
        void routerNavigate({ to });
      },
    }),
    [authClient, basePaths, localization, features, routerNavigate]
  );

  return (
    <AuthUIContext.Provider value={value}>{children}</AuthUIContext.Provider>
  );
}

export function useAuthUI(): AuthUIContextValue {
  const ctx = React.useContext(AuthUIContext);
  if (!ctx) {
    throw new Error("useAuthUI harus digunakan di dalam <AuthUIProvider>.");
  }
  return ctx;
}

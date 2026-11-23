import * as React from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";

export function SignedIn({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user) return null;
  return <>{children}</>;
}

export function AuthLoading({
  isLoading,
  children,
}: {
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  if (!isLoading) return null;
  return <>{children}</>;
}

export function RedirectToSignIn() {
  const { basePaths, navigate } = useAuthUI();
  const user = useAuthStore((s) => s.user);

  React.useEffect(() => {
    if (!user) {
      navigate(basePaths.signIn);
    }
  }, [user, basePaths.signIn, navigate]);

  return null;
}

export function RedirectToSignUp() {
  const { basePaths, navigate } = useAuthUI();
  const user = useAuthStore((s) => s.user);

  React.useEffect(() => {
    if (!user) {
      navigate(basePaths.signUp);
    }
  }, [user, basePaths.signUp, navigate]);

  return null;
}

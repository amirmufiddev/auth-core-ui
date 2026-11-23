import { AuthView } from "@/components/better-auth";

export function LoginPage({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  return <AuthView view="SIGN_IN" redirectTo={redirectTo} />;
}

export function RegisterPage() {
  return <AuthView view="SIGN_UP" />;
}

export function ForgotPasswordPage() {
  return <AuthView view="FORGOT_PASSWORD" />;
}

export function VerifyTwoFactorPage() {
  return <AuthView view="TWO_FACTOR" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { AuthView } from "@/components/better-auth";

function ForgotPasswordRoute() {
  return <AuthView view="FORGOT_PASSWORD" />;
}

export const Route = createFileRoute("/_auth/forgot-password")({
  component: ForgotPasswordRoute,
});

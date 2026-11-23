import { createFileRoute } from "@tanstack/react-router";
import { AuthView } from "@/components/better-auth";

function VerifyTwoFactorRoute() {
  return <AuthView view="TWO_FACTOR" />;
}

export const Route = createFileRoute("/_auth/verify-2fa")({
  component: VerifyTwoFactorRoute,
});

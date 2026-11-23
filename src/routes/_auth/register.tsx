import { createFileRoute } from "@tanstack/react-router";
import { AuthView } from "@/components/better-auth";

function RegisterRoute() {
  return <AuthView view="SIGN_UP" />;
}

export const Route = createFileRoute("/_auth/register")({
  component: RegisterRoute,
});

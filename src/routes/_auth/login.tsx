import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthView } from "@/components/better-auth";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

function LoginRoute() {
  const search = Route.useSearch();
  return <AuthView view="SIGN_IN" redirectTo={search.redirect} />;
}

export const Route = createFileRoute("/_auth/login")({
  validateSearch: loginSearchSchema,
  component: LoginRoute,
});

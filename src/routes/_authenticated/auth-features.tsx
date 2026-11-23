import { createFileRoute } from "@tanstack/react-router";
import { AuthFeaturesPage } from "@/features/auth-features/AuthFeaturesPage";
import {
  type AuthFeaturesSearchParams,
  authFeaturesSearchSchema,
} from "@/features/audit-logs/schema";

function AuthFeaturesRouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleUpdateSearch = (patch: Partial<AuthFeaturesSearchParams>) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  };

  return (
    <AuthFeaturesPage
      searchParams={search}
      onUpdateSearch={handleUpdateSearch}
    />
  );
}

export const Route = createFileRoute("/_authenticated/auth-features")({
  validateSearch: authFeaturesSearchSchema,
  component: AuthFeaturesRouteComponent,
});

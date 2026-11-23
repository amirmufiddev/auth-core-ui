import { createFileRoute } from "@tanstack/react-router";
import { ApiKeysPage } from "@/features/api-keys/ApiKeysPage";
import {
  type ApiKeysSearchParams,
  apiKeysSearchSchema,
} from "@/features/api-keys/schema";

function ApiKeysRouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleUpdateSearch = (patch: Partial<ApiKeysSearchParams>) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  };

  return (
    <ApiKeysPage searchParams={search} onUpdateSearch={handleUpdateSearch} />
  );
}

export const Route = createFileRoute("/_authenticated/api-keys")({
  validateSearch: apiKeysSearchSchema,
  component: ApiKeysRouteComponent,
});

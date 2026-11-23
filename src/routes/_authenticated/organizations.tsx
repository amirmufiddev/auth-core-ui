import { createFileRoute } from "@tanstack/react-router";
import { OrganizationsPage } from "@/features/organizations/OrganizationsPage";
import {
  type OrganizationsSearchParams,
  organizationsSearchSchema,
} from "@/features/organizations/schema";

function OrganizationsRouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleUpdateSearch = (patch: Partial<OrganizationsSearchParams>) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  };

  return (
    <OrganizationsPage
      searchParams={search}
      onUpdateSearch={handleUpdateSearch}
    />
  );
}

export const Route = createFileRoute("/_authenticated/organizations")({
  validateSearch: organizationsSearchSchema,
  component: OrganizationsRouteComponent,
});

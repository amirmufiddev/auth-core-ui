import { createFileRoute } from "@tanstack/react-router";
import { SessionsPage } from "@/features/sessions/SessionsPage";
import {
  type SessionsSearchParams,
  sessionsSearchSchema,
} from "@/features/audit-logs/schema";

function SessionsRouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleUpdateSearch = (patch: Partial<SessionsSearchParams>) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  };

  return (
    <SessionsPage searchParams={search} onUpdateSearch={handleUpdateSearch} />
  );
}

export const Route = createFileRoute("/_authenticated/sessions")({
  validateSearch: sessionsSearchSchema,
  component: SessionsRouteComponent,
});

import { createFileRoute } from "@tanstack/react-router";
import { AuditLogsPage } from "@/features/audit-logs/AuditLogsPage";
import {
  type AuditLogsSearchParams,
  auditLogsSearchSchema,
} from "@/features/audit-logs/schema";

function AuditLogsRouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleUpdateSearch = (patch: Partial<AuditLogsSearchParams>) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  };

  return (
    <AuditLogsPage searchParams={search} onUpdateSearch={handleUpdateSearch} />
  );
}

export const Route = createFileRoute("/_authenticated/audit-logs")({
  validateSearch: auditLogsSearchSchema,
  component: AuditLogsRouteComponent,
});

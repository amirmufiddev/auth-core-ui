import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/features/users/UsersPage";
import {
  type UsersSearchParams,
  usersSearchSchema,
} from "@/features/users/schema";

function UsersRouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleUpdateSearch = (patch: Partial<UsersSearchParams>) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  };

  return (
    <UsersPage searchParams={search} onUpdateSearch={handleUpdateSearch} />
  );
}

export const Route = createFileRoute("/_authenticated/users")({
  validateSearch: usersSearchSchema,
  component: UsersRouteComponent,
});

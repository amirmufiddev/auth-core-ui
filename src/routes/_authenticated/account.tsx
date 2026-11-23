import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AccountView, type AccountViewTab } from "@/components/better-auth";

const accountSearchSchema = z.object({
  tab: z
    .enum(["profile", "security", "sessions", "api-keys", "preferences"])
    .catch("profile"),
});

function AccountRouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleTabChange = (tab: AccountViewTab) => {
    void navigate({
      search: { tab },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-default-900">
          Account & Security Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola profil pribadi, kata sandi, 2FA, passkeys, provider OAuth, sesi
          aktif, dan API keys Anda.
        </p>
      </div>
      <AccountView activeTab={search.tab} onTabChange={handleTabChange} />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/account")({
  validateSearch: accountSearchSchema,
  component: AccountRouteComponent,
});

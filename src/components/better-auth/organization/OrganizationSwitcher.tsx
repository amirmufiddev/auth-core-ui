import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Settings,
  User,
} from "lucide-react";
import { listOrganizations } from "@/api/auth-service";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { CreateOrganizationDialog } from "@/components/better-auth/organization/CreateOrganizationDialog";
import { OrganizationLogo } from "@/components/better-auth/organization/OrganizationLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface OrganizationSwitcherProps {
  hidePersonal?: boolean;
  hideCreate?: boolean;
  onSetActive?: (orgId: string | null) => void;
}

export function OrganizationSwitcher({
  hidePersonal = false,
  hideCreate = false,
  onSetActive,
}: OrganizationSwitcherProps) {
  const { basePaths } = useAuthUI();
  const isOrgEnabled = useAuthConfigStore((s) =>
    s.isFeatureEnabled("organization")
  );
  const user = useAuthStore((s) => s.user);
  const activeOrgId = useAuthStore((s) => s.activeOrgId);
  const setActiveOrgId = useAuthStore((s) => s.setActiveOrgId);

  const [createOpen, setCreateOpen] = useState(false);

  const orgsQuery = useQuery({
    queryKey: ["organizations-switcher"],
    queryFn: () => listOrganizations({ page: 0, pageSize: 20 }),
    enabled: isOrgEnabled && Boolean(user),
  });

  if (!isOrgEnabled || !user) return null;

  const orgs = orgsQuery.data?.items ?? [];
  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? null;

  const handleSelect = (orgId: string | null, label: string) => {
    setActiveOrgId(orgId);
    onSetActive?.(orgId);
    toast.success(`Konteks aktif: ${label}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            color="secondary"
            size="sm"
            className="hidden bg-card h-9 max-w-[200px] justify-between gap-2 sm:inline-flex hover"
          >
            <span className="flex min-w-0 items-center gap-2">
              {activeOrg ? (
                <OrganizationLogo
                  name={activeOrg.name}
                  slug={activeOrg.slug}
                  size="sm"
                />
              ) : (
                <User className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate text-xs font-medium">
                {activeOrg ? activeOrg.name : "Personal Account"}
              </span>
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Switch Tenant / Workspace
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {!hidePersonal && (
            <DropdownMenuItem
              onClick={() => handleSelect(null, "Personal Account")}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Personal Account</span>
              </span>
              {!activeOrgId && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          )}

          {orgs.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSelect(org.id, org.name)}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex min-w-0 items-center gap-2">
                <OrganizationLogo name={org.name} slug={org.slug} size="sm" />
                <span className="truncate text-xs font-medium">{org.name}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Badge
                  color="secondary"
                  variant="soft"
                  className="px-1.5 py-0 text-[10px]"
                >
                  {org.plan}
                </Badge>
                {activeOrgId === org.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {!hideCreate && (
            <DropdownMenuItem onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4 text-primary" />
              <span>Buat Organisasi Baru</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link to={basePaths.organizations} className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Kelola Organisasi</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(created) => handleSelect(created.id, created.name)}
      />
    </>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Building2, Eye, Plus, ShieldCheck, Users } from "lucide-react";
import { listOrganizations } from "@/api/auth-service";
import { type OrganizationRecord } from "@/api/mock-db";
import { formatDate } from "@/lib/utils";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { type OrganizationsSearchParams } from "@/features/organizations/schema";
import {
  CreateOrganizationDialog,
  OrganizationLogo,
  OrganizationView,
} from "@/components/better-auth";
import { FeatureDisabledCard } from "@/components/layout/FeatureDisabledCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface OrganizationsPageProps {
  searchParams: OrganizationsSearchParams;
  onUpdateSearch: (patch: Partial<OrganizationsSearchParams>) => void;
}

export function OrganizationsPage({
  searchParams,
  onUpdateSearch,
}: OrganizationsPageProps) {
  const isOrgEnabled = useAuthConfigStore((s) =>
    s.isFeatureEnabled("organization")
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationRecord | null>(
    null
  );

  const orgsQuery = useQuery({
    queryKey: ["organizations", searchParams],
    queryFn: () =>
      listOrganizations({
        page: searchParams.page,
        pageSize: searchParams.pageSize,
        search: searchParams.search,
      }),
    enabled: isOrgEnabled,
  });

  if (!isOrgEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Organizations & Multi-Tenancy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manajemen tenant, anggota, sub-tim, dan undangan tenant.
          </p>
        </div>
        <FeatureDisabledCard featureId="organization" />
      </div>
    );
  }

  const orgs = orgsQuery.data?.items ?? [];
  const total = orgsQuery.data?.total ?? 0;

  const columns: ColumnDef<OrganizationRecord>[] = [
    {
      accessorKey: "name",
      header: "Organisasi",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <OrganizationLogo
            name={row.original.name}
            slug={row.original.slug}
            size="md"
          />
          <div>
            <div className="font-semibold text-default-900">
              {row.original.name}
            </div>
            <div className="font-semiboldums text-xs text-muted-foreground">
              {row.original.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row }) => (
        <Badge
          color={
            row.original.plan === "Enterprise"
              ? "default"
              : row.original.plan === "Pro"
                ? "info"
                : "secondary"
          }
          variant="soft"
        >
          {row.original.plan}
        </Badge>
      ),
    },
    {
      accessorKey: "memberCount",
      header: "Members & Teams",
      cell: ({ row }) => (
        <span className="text-xs text-default-700">
          {row.original.memberCount} members · {row.original.teamCount} teams
        </span>
      ),
    },
    {
      accessorKey: "ssoEnabled",
      header: "SSO",
      cell: ({ row }) => (
        <Badge
          color={row.original.ssoEnabled ? "success" : "secondary"}
          variant="outline"
        >
          {row.original.ssoEnabled ? "SSO Ready" : "Standard"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Dibuat",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            color="primary"
            onClick={() => setSelectedOrg(row.original)}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Kelola Tenant
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Organizations & Multi-Tenancy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola tenant organisasi, sub-tim, peran member, dan undangan email.
          </p>
        </div>
        <Button color="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Organisasi
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Organisasi</span>
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>SSO Enabled Tenants</span>
              <ShieldCheck className="h-4 w-4 text-success" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {orgs.filter((o) => o.ssoEnabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Members (Halaman)</span>
              <Users className="h-4 w-4 text-info" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {orgs.reduce((sum, o) => sum + o.memberCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="mb-0">
          <CardTitle className="text-base font-semibold">
            Daftar Tenant Organisasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={orgs}
            totalCount={total}
            pageIndex={searchParams.page}
            pageSize={searchParams.pageSize}
            onPaginationChange={(next) =>
              onUpdateSearch({ page: next.pageIndex, pageSize: next.pageSize })
            }
            searchValue={searchParams.search}
            onSearchChange={(val) => onUpdateSearch({ search: val, page: 0 })}
            searchPlaceholder="Cari nama atau slug organisasi..."
            isLoading={orgsQuery.isLoading}
          />
        </CardContent>
      </Card>

      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Sheet
        open={Boolean(selectedOrg)}
        onOpenChange={(open) => !open && setSelectedOrg(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selectedOrg && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <OrganizationLogo
                    name={selectedOrg.name}
                    slug={selectedOrg.slug}
                    size="lg"
                  />
                  <div>
                    <SheetTitle>{selectedOrg.name}</SheetTitle>
                    <SheetDescription>
                      Slug:{" "}
                      <span className="font-medium text-foreground">{selectedOrg.slug}</span> ·
                      Plan {selectedOrg.plan}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6">
                <OrganizationView
                  organization={selectedOrg}
                  onOrganizationUpdated={(updated) => setSelectedOrg(updated)}
                  onOrganizationDeleted={() => setSelectedOrg(null)}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  Laptop,
  LogOut,
  ShieldAlert,
  Smartphone,
  Terminal,
  Trash2,
} from "lucide-react";
import {
  listSessions,
  revokeInactiveSessions,
  revokeSession,
} from "@/api/auth-service";
import { type SessionRecord } from "@/api/mock-db";
import { formatDate } from "@/lib/utils";
import { type SessionsSearchParams } from "@/features/audit-logs/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { toast } from "sonner";

interface SessionsPageProps {
  searchParams: SessionsSearchParams;
  onUpdateSearch: (patch: Partial<SessionsSearchParams>) => void;
}

export function SessionsPage({
  searchParams,
  onUpdateSearch,
}: SessionsPageProps) {
  const queryClient = useQueryClient();

  const combinedSince = (() => {
    if (!searchParams.sinceDate) return "";
    const time = searchParams.sinceTime || "00:00";
    return `${searchParams.sinceDate}T${time}:00`;
  })();

  const sessionsQuery = useQuery({
    queryKey: ["sessions", searchParams, combinedSince],
    queryFn: () =>
      listSessions({
        page: searchParams.page,
        pageSize: searchParams.pageSize,
        search: searchParams.search,
        status: searchParams.status,
        sinceDate: combinedSince,
      }),
  });

  const revokeMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("Sesi berhasil dicabut.");
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: revokeInactiveSessions,
    onSuccess: (removedCount) => {
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(`${removedCount} sesi kedaluwarsa dibersihkan.`);
    },
  });

  const sessions = sessionsQuery.data?.items ?? [];
  const total = sessionsQuery.data?.total ?? 0;

  const columns: ColumnDef<SessionRecord>[] = [
    {
      accessorKey: "userName",
      header: "Pengguna",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-default-900">
            {row.original.userName}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.userEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "userAgent",
      header: "Perangkat & Lokasi",
      cell: ({ row }) => {
        const Icon =
          row.original.deviceType === "Mobile"
            ? Smartphone
            : row.original.deviceType === "CLI"
              ? Terminal
              : Laptop;
        return (
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-muted p-1.5 text-default-700">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-medium text-default-900">
                {row.original.userAgent}
              </div>
              <div className="font-semiboldums text-[11px] text-muted-foreground">
                {row.original.ipAddress} · {row.original.location}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "tokenPreview",
      header: "Token",
      cell: ({ row }) => (
        <span className="rounded bg-muted px-2 py-0.5 font-semiboldums text-xs text-default-800">
          {row.original.tokenPreview}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            color={row.original.active ? "success" : "secondary"}
            variant="soft"
          >
            {row.original.active ? "Active" : "Expired"}
          </Badge>
          {row.original.impersonatedBy && (
            <Badge color="warning" variant="outline" className="text-[11px]">
              Impersonated
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Berakhir",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.expiresAt, "dd MMM · HH:mm")}
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
            variant="outline"
            color="destructive"
            disabled={!row.original.active || revokeMutation.isPending}
            onClick={() => revokeMutation.mutate(row.original.id)}
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Revoke
          </Button>
        </div>
      ),
    },
  ];

  const selectedDateObj = searchParams.sinceDate
    ? new Date(`${searchParams.sinceDate}T00:00:00`)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Sessions & Active Devices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor sesi aktif, token impersonation, dan cabut akses perangkat.
          </p>
        </div>
        <Button
          variant="outline"
          color="destructive"
          disabled={cleanupMutation.isPending}
          onClick={() => cleanupMutation.mutate()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Bersihkan Sesi Kedaluwarsa
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Sesi Terpantau</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Sesi Aktif (Halaman)</span>
              <Laptop className="h-4 w-4 text-success" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {sessions.filter((s) => s.active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Sesi Impersonation</span>
              <ShieldAlert className="h-4 w-4 text-warning" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {sessions.filter((s) => Boolean(s.impersonatedBy)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="mb-0 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base font-semibold">
            Daftar Sesi Perangkat
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-44">
              <DatePicker
                value={selectedDateObj}
                onChange={(date) =>
                  onUpdateSearch({
                    sinceDate: date ? date.toISOString().slice(0, 10) : "",
                    page: 0,
                  })
                }
                placeholder="Sejak tanggal"
              />
            </div>
            <div className="w-36">
              <TimePicker
                value={searchParams.sinceTime}
                onChange={(time) =>
                  onUpdateSearch({ sinceTime: time, page: 0 })
                }
                placeholder="Jam mulai"
              />
            </div>
            <Select
              value={searchParams.status}
              onValueChange={(val) =>
                onUpdateSearch({
                  status: val as SessionsSearchParams["status"],
                  page: 0,
                })
              }
            >
              <SelectTrigger className="h-9 w-36" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={sessions}
            totalCount={total}
            pageIndex={searchParams.page}
            pageSize={searchParams.pageSize}
            onPaginationChange={(next) =>
              onUpdateSearch({ page: next.pageIndex, pageSize: next.pageSize })
            }
            searchValue={searchParams.search}
            onSearchChange={(val) => onUpdateSearch({ search: val, page: 0 })}
            searchPlaceholder="Cari user, IP address, browser..."
            isLoading={sessionsQuery.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

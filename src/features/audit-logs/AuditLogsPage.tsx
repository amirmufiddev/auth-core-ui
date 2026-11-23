import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RefreshCw, ScrollText, Search } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { fetchAuditLogsPage } from "@/api/auth-service";
import {
  type AuditCategory,
  type AuditLogRecord,
  type AuditSeverity,
} from "@/api/mock-db";
import { formatDate } from "@/lib/utils";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { type AuditLogsSearchParams } from "@/features/audit-logs/schema";
import { FeatureDisabledCard } from "@/components/layout/FeatureDisabledCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLogsPageProps {
  searchParams: AuditLogsSearchParams;
  onUpdateSearch: (patch: Partial<AuditLogsSearchParams>) => void;
}

export function AuditLogsPage({
  searchParams,
  onUpdateSearch,
}: AuditLogsPageProps) {
  const isAuditEnabled = useAuthConfigStore((s) =>
    s.isFeatureEnabled("auditLogs"),
  );
  const [selectedEvent, setSelectedEvent] = useState<AuditLogRecord | null>(
    null,
  );

  const logsQuery = useInfiniteQuery({
    queryKey: ["audit-logs", searchParams],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchAuditLogsPage({
        cursor: pageParam,
        limit: 30,
        search: searchParams.search,
        severity: searchParams.severity,
        category: searchParams.category,
        fromDate: searchParams.fromDate,
        toDate: searchParams.toDate,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuditEnabled,
  });

  const allItems = useMemo(
    () => logsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [logsQuery.data],
  );

  const totalCount = logsQuery.data?.pages[0]?.totalCount ?? 0;

  if (!isAuditEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Security Audit Logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jejak audit autentikasi & RBAC tervirtualisasi.
          </p>
        </div>
        <FeatureDisabledCard featureId="auditLogs" />
      </div>
    );
  }

  const dateRange =
    searchParams.fromDate || searchParams.toDate
      ? {
          from: searchParams.fromDate
            ? new Date(`${searchParams.fromDate}T00:00:00`)
            : undefined,
          to: searchParams.toDate
            ? new Date(`${searchParams.toDate}T00:00:00`)
            : undefined,
        }
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Security Audit Logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stream {totalCount.toLocaleString("id-ID")} event autentikasi
            menggunakan{" "}
            <span className="rounded bg-muted px-1.5 py-0.5 font-semiboldums text-xs">
              react-virtuoso + useInfiniteQuery
            </span>
            .
          </p>
        </div>

        <Button
          onClick={() => void logsQuery.refetch()}
          disabled={logsQuery.isFetching}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Stream
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchParams.search}
              onChange={(e) => onUpdateSearch({ search: e.target.value })}
              placeholder="Cari event, actor, IP..."
              className="pl-9"
            />
          </div>

          <Select
            value={searchParams.severity}
            onValueChange={(val) =>
              onUpdateSearch({ severity: val as "all" | AuditSeverity })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Severity</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={searchParams.category}
            onValueChange={(val) =>
              onUpdateSearch({ category: val as "all" | AuditCategory })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="admin">Admin Actions</SelectItem>
              <SelectItem value="rbac">RBAC & Roles</SelectItem>
              <SelectItem value="organization">Organizations</SelectItem>
              <SelectItem value="api-key">API Keys</SelectItem>
              <SelectItem value="config">Auth Config</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker
            align="end"
            value={dateRange}
            onChange={(range) =>
              onUpdateSearch({
                fromDate: range?.from
                  ? range.from.toISOString().slice(0, 10)
                  : "",
                toDate: range?.to ? range.to.toISOString().slice(0, 10) : "",
              })
            }
            placeholder="Rentang tanggal..."
          />
        </CardContent>
      </Card>

      {/* Virtualized Infinite List */}
      <Card>
        <CardHeader className="mb-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Event Stream ({allItems.length} dimuat dari {totalCount})
            </CardTitle>
          </div>
          <Badge
            color="info"
            variant="soft"
            className="font-semiboldums text-xs"
          >
            Virtualized
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {logsQuery.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} className="h-14 w-full" />
              ))}
            </div>
          ) : allItems.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Tidak ada event audit yang sesuai filter.
            </div>
          ) : (
            <div className="h-140 w-full">
              <Virtuoso
                data={allItems}
                endReached={() => {
                  if (logsQuery.hasNextPage && !logsQuery.isFetchingNextPage) {
                    void logsQuery.fetchNextPage();
                  }
                }}
                itemContent={(_, item) => (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedEvent(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedEvent(item);
                      }
                    }}
                    className="flex cursor-pointer flex-col justify-between gap-2 border-b border-border px-4 py-3 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-muted px-2 py-0.5 font-semiboldums text-xs font-medium text-default-900">
                          {item.event}
                        </span>
                        <Badge
                          color={
                            item.severity === "critical"
                              ? "destructive"
                              : item.severity === "warning"
                                ? "warning"
                                : "info"
                          }
                          variant="soft"
                          className="text-[10px]"
                        >
                          {item.severity}
                        </Badge>
                        <Badge
                          color="secondary"
                          variant="outline"
                          className="text-[10px]"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        Actor:{" "}
                        <span className="font-medium text-default-800">
                          {item.actorEmail}
                        </span>{" "}
                        · Target:{" "}
                        <span className="font-medium text-foreground">
                          {item.target}
                        </span>{" "}
                        · IP:{" "}
                        <span className="tabular-nums font-medium text-foreground">
                          {item.ipAddress}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      {formatDate(item.createdAt, "dd MMM yyyy · HH:mm")}
                    </div>
                  </div>
                )}
                components={{
                  Footer: () =>
                    logsQuery.isFetchingNextPage ? (
                      <div className="p-4">
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : !logsQuery.hasNextPage ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        Semua {totalCount} log telah ditampilkan.
                      </div>
                    ) : null,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event JSON Detail Dialog */}
      <Dialog
        open={Boolean(selectedEvent)}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="font-semiboldums text-base">
              {selectedEvent?.event}
            </DialogTitle>
            <DialogDescription>
              Event ID: {selectedEvent?.id} ·{" "}
              {selectedEvent ? formatDate(selectedEvent.createdAt, "PPpp") : ""}
            </DialogDescription>
          </DialogHeader>
          <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted p-4 font-semibold text-xs text-default-900">
            <code>{JSON.stringify(selectedEvent, null, 2)}</code>
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}

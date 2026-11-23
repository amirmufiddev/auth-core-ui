import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Copy,
  KeyRound,
  Laptop,
  LogOut,
  Plus,
  Smartphone,
  Terminal,
  Trash2,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  createApiKey,
  deleteApiKey,
  listApiKeys,
  listSessions,
  revokeSession,
  toggleApiKey,
} from "@/api/auth-service";
import { formatDate } from "@/lib/utils";
import {
  type CreateApiKeyValues,
  createApiKeySchema,
} from "@/features/api-keys/schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function SessionsCard() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const sessionsQuery = useQuery({
    queryKey: ["account-sessions", user?.email],
    queryFn: () =>
      listSessions({
        page: 0,
        pageSize: 20,
        search: user?.email ?? "",
      }),
    enabled: Boolean(user),
  });

  const revokeMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["account-sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Sesi perangkat dicabut.");
    },
  });

  const sessions = sessionsQuery.data?.items ?? [];

  return (
    <Card>
      <CardHeader className="mb-0">
        <CardTitle className="text-base font-semibold">
          Sesi Aktif Perangkat
        </CardTitle>
        <CardDescription>
          Daftar browser dan perangkat yang terautentikasi untuk akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {sessionsQuery.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : sessions.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Hanya sesi browser saat ini yang aktif.
          </p>
        ) : (
          sessions.map((ses, idx) => {
            const Icon =
              ses.deviceType === "Mobile"
                ? Smartphone
                : ses.deviceType === "CLI"
                  ? Terminal
                  : Laptop;
            return (
              <div
                key={ses.id}
                className="flex flex-col justify-between gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-muted p-2 text-default-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-default-900">
                        {ses.userAgent}
                      </span>
                      {idx === 0 && (
                        <Badge color="success" variant="soft" className="text-[10px]">
                          Current Session
                        </Badge>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {ses.ipAddress} · {ses.location} · Exp{" "}
                      {formatDate(ses.expiresAt)}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  color="destructive"
                  disabled={!ses.active || revokeMutation.isPending}
                  onClick={() => revokeMutation.mutate(ses.id)}
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  {ses.active ? "Revoke" : "Expired"}
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

const KEY_SCOPES = ["users:read", "sessions:verify", "orgs:read", "audit:read"];

export function ApiKeysCard() {
  const queryClient = useQueryClient();
  const { features } = useAuthUI();
  const user = useAuthStore((s) => s.user);
  const [createOpen, setCreateOpen] = useState(false);
  const [plainSecret, setPlainSecret] = useState<string | null>(null);

  const apiKeyEnabled = Boolean(features.apiKey?.enabled);

  const keysQuery = useQuery({
    queryKey: ["account-api-keys", user?.email],
    queryFn: () =>
      listApiKeys({
        page: 0,
        pageSize: 20,
        search: user?.email ?? "",
      }),
    enabled: apiKeyEnabled && Boolean(user),
  });

  const form = useForm<CreateApiKeyValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      prefix: "ak_live_",
      ownerEmail: user?.email ?? "admin@authcore.io",
      rateLimitMax: 300,
      scopes: ["users:read", "sessions:verify"],
      expiresAt: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (vals: CreateApiKeyValues) =>
      createApiKey({
        name: vals.name,
        prefix: vals.prefix,
        ownerEmail: user?.email ?? vals.ownerEmail,
        scopes: vals.scopes,
        rateLimitMax: vals.rateLimitMax,
        expiresAt: vals.expiresAt?.toISOString(),
      }),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ["account-api-keys"] });
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setCreateOpen(false);
      form.reset();
      setPlainSecret(res.plainSecret);
      toast.success("API Key pribadi dibuat.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      toggleApiKey(id, enabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["account-api-keys"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["account-api-keys"] });
      toast.success("API Key dicabut.");
    },
  });

  if (!apiKeyEnabled) {
    return (
      <Card>
        <CardHeader className="mb-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">API Keys</CardTitle>
            <CardDescription>
              Plugin API Key sedang dinonaktifkan di konfigurasi AuthCore.
            </CardDescription>
          </div>
          <Badge color="warning" variant="soft">
            Plugin Off
          </Badge>
        </CardHeader>
      </Card>
    );
  }

  const keys = keysQuery.data?.items ?? [];

  return (
    <>
      <Card>
        <CardHeader className="mb-0 flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Personal API Keys
            </CardTitle>
            <CardDescription>
              Buat dan kelola API token ter-hash untuk integrasi skrip/CLI.
            </CardDescription>
          </div>
          <Button size="sm" color="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Buat Key
          </Button>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-4">
          {keys.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Belum ada API key untuk akun ini.
            </p>
          ) : (
            keys.map((k) => (
              <div
                key={k.id}
                className="flex flex-col justify-between gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium text-default-900">
                      {k.name}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px]">
                      {k.keyPreview}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Rate limit: {k.rateLimitMax}/min · Scopes:{" "}
                    {k.scopes.join(", ")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={k.enabled}
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ id: k.id, enabled: checked })
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    color="destructive"
                    className="h-8 w-8"
                    onClick={() => deleteMutation.mutate(k.id)}
                    aria-label="Hapus API Key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Buat Personal API Key</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((vals) => createMutation.mutate(vals))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="ba-ak-name">Nama Key</Label>
              <Input
                id="ba-ak-name"
                placeholder="Mis. CLI Automation"
                {...form.register("name")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ba-ak-prefix">Prefix</Label>
                <Input
                  id="ba-ak-prefix"
                  className="font-mono"
                  {...form.register("prefix")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kedaluwarsa</Label>
                <Controller
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Opsional"
                    />
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Scopes</Label>
              <Controller
                control={form.control}
                name="scopes"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {KEY_SCOPES.map((sc) => (
                      <div
                        key={sc}
                        className="flex items-center gap-2 rounded border border-border p-2"
                      >
                        <Checkbox
                          id={`ba-ak-sc-${sc}`}
                          checked={field.value.includes(sc)}
                          onCheckedChange={(val) => {
                            const next = val
                              ? [...field.value, sc]
                              : field.value.filter((item) => item !== sc);
                            field.onChange(next);
                          }}
                        />
                        <Label
                          htmlFor={`ba-ak-sc-${sc}`}
                          className="cursor-pointer font-mono text-xs"
                        >
                          {sc}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                onClick={() => setCreateOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" color="primary">
                Terbitkan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(plainSecret)}
        onOpenChange={(open) => !open && setPlainSecret(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Salin API Key Anda
            </DialogTitle>
            <DialogDescription>
              Token ini tidak akan ditampilkan lagi setelah dialog ditutup.
            </DialogDescription>
          </DialogHeader>
          <Alert color="warning" variant="soft">
            <AlertTitle className="text-sm">Secret Key</AlertTitle>
            <AlertDescription className="mt-1 break-all font-mono text-xs">
              {plainSecret}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              color="primary"
              onClick={async () => {
                if (plainSecret) {
                  await navigator.clipboard.writeText(plainSecret);
                  toast.success("Secret disalin ke clipboard.");
                }
                setPlainSecret(null);
              }}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Salin & Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

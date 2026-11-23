import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Copy,
  Globe,
  KeyRound,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  createApiKey,
  createOAuthClient,
  createSsoProvider,
  deleteApiKey,
  listApiKeys,
  listOAuthClients,
  listSsoProviders,
  toggleApiKey,
} from "@/api/auth-service";
import { type ApiKeyRecord, type OAuthClientRecord } from "@/api/mock-db";
import { formatDate } from "@/lib/utils";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import {
  type ApiKeysSearchParams,
  type CreateApiKeyValues,
  type CreateOAuthClientValues,
  type CreateSsoProviderValues,
  createApiKeySchema,
  createOAuthClientSchema,
  createSsoProviderSchema,
} from "@/features/api-keys/schema";
import { FeatureDisabledCard } from "@/components/layout/FeatureDisabledCard";
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
import { DataTable } from "@/components/ui/data-table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AVAILABLE_API_SCOPES = [
  "users:read",
  "users:write",
  "sessions:verify",
  "tokens:introspect",
  "orgs:read",
  "audit:read",
  "audit:write",
];

interface ApiKeysPageProps {
  searchParams: ApiKeysSearchParams;
  onUpdateSearch: (patch: Partial<ApiKeysSearchParams>) => void;
}

export function ApiKeysPage({
  searchParams,
  onUpdateSearch,
}: ApiKeysPageProps) {
  const queryClient = useQueryClient();
  const isApiKeyEnabled = useAuthConfigStore((s) =>
    s.isFeatureEnabled("apiKey"),
  );
  const isOAuthEnabled = useAuthConfigStore((s) =>
    s.isFeatureEnabled("oauthProvider"),
  );
  const isSsoEnabled = useAuthConfigStore((s) => s.isFeatureEnabled("sso"));

  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [createSsoOpen, setCreateSsoOpen] = useState(false);

  const apiKeysQuery = useQuery({
    queryKey: ["api-keys", searchParams],
    queryFn: () =>
      listApiKeys({
        page: searchParams.page,
        pageSize: searchParams.pageSize,
        search: searchParams.search,
      }),
    enabled: isApiKeyEnabled && searchParams.tab === "api-keys",
  });

  const oauthClientsQuery = useQuery({
    queryKey: ["oauth-clients", searchParams],
    queryFn: () =>
      listOAuthClients({
        page: searchParams.page,
        pageSize: searchParams.pageSize,
        search: searchParams.search,
      }),
    enabled: isOAuthEnabled && searchParams.tab === "oauth-clients",
  });

  const ssoQuery = useQuery({
    queryKey: ["sso-providers"],
    queryFn: listSsoProviders,
    enabled: isSsoEnabled && searchParams.tab === "sso-scim",
  });

  const keyForm = useForm<CreateApiKeyValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      prefix: "ak_live_",
      ownerEmail: "admin@authcore.io",
      rateLimitMax: 500,
      scopes: ["users:read", "sessions:verify"],
      expiresAt: undefined,
    },
  });

  const oauthForm = useForm<CreateOAuthClientValues>({
    resolver: zodResolver(createOAuthClientSchema),
    defaultValues: {
      name: "",
      type: "oidc-public",
      redirectUri: "http://localhost:5173/callback",
      scopesText: "openid profile email",
      pkceRequired: true,
    },
  });

  const ssoForm = useForm<CreateSsoProviderValues>({
    resolver: zodResolver(createSsoProviderSchema),
    defaultValues: {
      name: "",
      protocol: "saml2",
      domain: "",
      organizationName: "Auth Core HQ",
      scimEnabled: false,
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: (vals: CreateApiKeyValues) =>
      createApiKey({
        name: vals.name,
        prefix: vals.prefix,
        ownerEmail: vals.ownerEmail,
        scopes: vals.scopes,
        rateLimitMax: vals.rateLimitMax,
        expiresAt: vals.expiresAt?.toISOString(),
      }),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setCreateKeyOpen(false);
      keyForm.reset();
      setRevealedSecret(res.plainSecret);
      toast.success("API Key berhasil diterbitkan.");
    },
  });

  const toggleKeyMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      toggleApiKey(id, enabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API Key dicabut permanen.");
    },
  });

  const createClientMutation = useMutation({
    mutationFn: (vals: CreateOAuthClientValues) =>
      createOAuthClient({
        name: vals.name,
        type: vals.type,
        redirectUris: [vals.redirectUri],
        scopes: vals.scopesText.split(/\s+/).filter(Boolean),
        pkceRequired: vals.pkceRequired,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["oauth-clients"] });
      setCreateClientOpen(false);
      oauthForm.reset();
      toast.success("OAuth / MCP Client berhasil didaftarkan.");
    },
  });

  const createSsoMutation = useMutation({
    mutationFn: createSsoProvider,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sso-providers"] });
      setCreateSsoOpen(false);
      ssoForm.reset();
      toast.success("Provider Enterprise SSO ditambahkan.");
    },
  });

  const apiKeyColumns: ColumnDef<ApiKeyRecord>[] = [
    {
      accessorKey: "name",
      header: "Nama & Prefix",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-default-900">
            {row.original.name}
          </div>
          <div className="tabular-nums text-xs text-muted-foreground">
            {row.original.keyPreview}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "ownerEmail",
      header: "Pemilik",
      cell: ({ row }) => (
        <span className="text-xs text-default-700">
          {row.original.ownerEmail}
        </span>
      ),
    },
    {
      accessorKey: "scopes",
      header: "Scopes",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.scopes.map((s) => (
            <Badge
              key={s}
              color="secondary"
              variant="soft"
              className="tabular-nums text-[10px]"
            >
              {s}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "rateLimitMax",
      header: "Rate Limit",
      cell: ({ row }) => (
        <span className="tabular-nums text-xs text-muted-foreground">
          {row.original.rateLimitMax}/min
        </span>
      ),
    },
    {
      accessorKey: "enabled",
      header: "Aktif",
      cell: ({ row }) => (
        <Switch
          checked={row.original.enabled}
          onCheckedChange={(checked) =>
            toggleKeyMutation.mutate({ id: row.original.id, enabled: checked })
          }
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            color="destructive"
            className="h-8 w-8"
            onClick={() => deleteKeyMutation.mutate(row.original.id)}
            aria-label="Cabut API Key"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const oauthColumns: ColumnDef<OAuthClientRecord>[] = [
    {
      accessorKey: "name",
      header: "Aplikasi Klien",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-default-900">
            {row.original.name}
          </div>
          <div className="tabular-nums text-xs text-muted-foreground">
            {row.original.clientId}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => (
        <Badge
          color={row.original.type === "mcp-client" ? "info" : "default"}
          variant="soft"
          className="tabular-nums text-xs"
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "redirectUris",
      header: "Redirect URIs",
      cell: ({ row }) => (
        <span className="tabular-nums text-xs text-muted-foreground">
          {row.original.redirectUris[0]}
        </span>
      ),
    },
    {
      accessorKey: "pkceRequired",
      header: "PKCE",
      cell: ({ row }) => (
        <Badge
          color={row.original.pkceRequired ? "success" : "warning"}
          variant="outline"
        >
          {row.original.pkceRequired ? "PKCE Enforced" : "Optional"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Terdaftar",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            API Keys, OAuth 2.1 & Enterprise SSO
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola kredensial mesin-ke-mesin, OIDC/MCP clients, dan SAML/SCIM
            federation.
          </p>
        </div>
      </div>

      <Tabs
        value={searchParams.tab}
        onValueChange={(val) =>
          onUpdateSearch({
            tab: val as ApiKeysSearchParams["tab"],
            page: 0,
            search: "",
          })
        }
      >
        <TabsList>
          <TabsTrigger value="api-keys">
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="oauth-clients">
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            OAuth 2.1 / MCP Clients
          </TabsTrigger>
          <TabsTrigger value="sso-scim">
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            Enterprise SSO & SCIM
          </TabsTrigger>
        </TabsList>

        {/* API KEYS TAB */}
        <TabsContent value="api-keys" className="pt-4">
          {!isApiKeyEnabled ? (
            <FeatureDisabledCard featureId="apiKey" />
          ) : (
            <Card>
              <CardHeader className="mb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Service API Keys
                  </CardTitle>
                  <CardDescription>
                    Token ter-hash dengan scoped permission & rate limiting.
                  </CardDescription>
                </div>
                <Button color="primary" onClick={() => setCreateKeyOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat API Key
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={apiKeyColumns}
                  data={apiKeysQuery.data?.items ?? []}
                  totalCount={apiKeysQuery.data?.total ?? 0}
                  pageIndex={searchParams.page}
                  pageSize={searchParams.pageSize}
                  onPaginationChange={(next) =>
                    onUpdateSearch({
                      page: next.pageIndex,
                      pageSize: next.pageSize,
                    })
                  }
                  searchValue={searchParams.search}
                  onSearchChange={(val) =>
                    onUpdateSearch({ search: val, page: 0 })
                  }
                  searchPlaceholder="Cari nama key atau pemilik..."
                  isLoading={apiKeysQuery.isLoading}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* OAUTH CLIENTS TAB */}
        <TabsContent value="oauth-clients" className="pt-4">
          {!isOAuthEnabled ? (
            <FeatureDisabledCard featureId="oauthProvider" />
          ) : (
            <Card>
              <CardHeader className="mb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Registered OAuth 2.1 / OIDC & MCP Clients
                  </CardTitle>
                  <CardDescription>
                    Aplikasi pihak ketiga dan AI agent client yang terhubung ke
                    Auth Core.
                  </CardDescription>
                </div>
                <Button
                  color="primary"
                  onClick={() => setCreateClientOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Register Client
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={oauthColumns}
                  data={oauthClientsQuery.data?.items ?? []}
                  totalCount={oauthClientsQuery.data?.total ?? 0}
                  pageIndex={searchParams.page}
                  pageSize={searchParams.pageSize}
                  onPaginationChange={(next) =>
                    onUpdateSearch({
                      page: next.pageIndex,
                      pageSize: next.pageSize,
                    })
                  }
                  searchValue={searchParams.search}
                  onSearchChange={(val) =>
                    onUpdateSearch({ search: val, page: 0 })
                  }
                  searchPlaceholder="Cari nama atau clientId..."
                  isLoading={oauthClientsQuery.isLoading}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SSO & SCIM TAB */}
        <TabsContent value="sso-scim" className="space-y-4 pt-4">
          {!isSsoEnabled ? (
            <FeatureDisabledCard featureId="sso" />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-default-900">
                    Koneksi SAML 2.0 / OIDC & SCIM Provisioning
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Federasi identitas perusahaan berdasarkan domain email
                    terverifikasi.
                  </p>
                </div>
                <Button color="primary" onClick={() => setCreateSsoOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah SSO Provider
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {(ssoQuery.data ?? []).map((provider) => (
                  <Card key={provider.id}>
                    <CardHeader className="mb-0 flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {provider.name}
                        </CardTitle>
                        <CardDescription className="tabular-nums text-xs">
                          {provider.providerId} · {provider.organizationName}
                        </CardDescription>
                      </div>
                      <Badge
                        color={
                          provider.protocol === "saml2" ? "default" : "info"
                        }
                        variant="soft"
                        className="uppercase"
                      >
                        {provider.protocol}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Domain Terikat
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="tabular-nums font-medium">
                            {provider.domain}
                          </span>
                          <Badge
                            color={
                              provider.domainVerified ? "success" : "warning"
                            }
                            variant="soft"
                          >
                            {provider.domainVerified
                              ? "DNS Verified"
                              : "Pending TXT"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          SCIM 2.0 Directory Sync
                        </span>
                        <Badge
                          color={provider.scimEnabled ? "success" : "secondary"}
                          variant="outline"
                        >
                          {provider.scimEnabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="rounded-md bg-muted p-2.5">
                        <div className="mb-1.5 font-semibold text-default-800">
                          Group-to-Role Mapping
                        </div>
                        <div className="space-y-1">
                          {provider.scimGroupMappings.map((m) => (
                            <div
                              key={m.idpGroup}
                              className="flex items-center justify-between tabular-nums text-[11px]"
                            >
                              <span>{m.idpGroup}</span>
                              <span className="text-primary">{m.appRole}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Buat API Key Baru</DialogTitle>
            <DialogDescription>
              Rahasia penuh hanya ditampilkan satu kali setelah dibuat.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={keyForm.handleSubmit((vals) =>
              createKeyMutation.mutate(vals),
            )}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="key-name">Nama API Key</Label>
              <Input
                id="key-name"
                placeholder="Mis. Payment Service Worker"
                {...keyForm.register("name")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="key-prefix">Prefix</Label>
                <Input id="key-prefix" {...keyForm.register("prefix")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="key-rl">Rate Limit / Menit</Label>
                <Input
                  id="key-rl"
                  type="number"
                  {...keyForm.register("rateLimitMax")}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="key-owner">Owner Email</Label>
                <Input id="key-owner" {...keyForm.register("ownerEmail")} />
              </div>
              <div className="space-y-1.5">
                <Label>Kedaluwarsa (Opsional)</Label>
                <Controller
                  control={keyForm.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tanpa batas waktu"
                    />
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Scoped Permissions</Label>
              <Controller
                control={keyForm.control}
                name="scopes"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_API_SCOPES.map((scope) => {
                      const checked = field.value.includes(scope);
                      return (
                        <div
                          key={scope}
                          className="flex items-center gap-2 rounded border border-border p-2"
                        >
                          <Checkbox
                            id={`scope-${scope}`}
                            checked={checked}
                            onCheckedChange={(val) => {
                              const next = val
                                ? [...field.value, scope]
                                : field.value.filter((s) => s !== scope);
                              field.onChange(next);
                            }}
                          />
                          <Label
                            htmlFor={`scope-${scope}`}
                            className="cursor-pointer tabular-nums text-xs"
                          >
                            {scope}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                onClick={() => setCreateKeyOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={createKeyMutation.isPending}
              >
                Terbitkan API Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reveal One-time API Key Secret */}
      <Dialog
        open={Boolean(revealedSecret)}
        onOpenChange={(open) => !open && setRevealedSecret(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Simpan API Key Anda Sekarang
            </DialogTitle>
            <DialogDescription>
              Demi keamanan, Auth Core hanya menyimpan hash dari key ini.
            </DialogDescription>
          </DialogHeader>
          <Alert color="warning">
            <AlertTitle className="text-sm">Secret Sekali Tampil</AlertTitle>
            <AlertDescription className="mt-1 tabular-nums text-xs break-all">
              {revealedSecret}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              type="button"
              color="primary"
              onClick={async () => {
                if (revealedSecret) {
                  await navigator.clipboard.writeText(revealedSecret);
                  toast.success("API Key disalin ke clipboard.");
                }
                setRevealedSecret(null);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Salin & Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register OAuth Client Dialog */}
      <Dialog open={createClientOpen} onOpenChange={setCreateClientOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Register OAuth 2.1 / MCP Client</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={oauthForm.handleSubmit((vals) =>
              createClientMutation.mutate(vals),
            )}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="oa-name">Nama Aplikasi</Label>
              <Input id="oa-name" {...oauthForm.register("name")} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipe Client</Label>
              <Controller
                control={oauthForm.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oidc-public">
                        OIDC Public (SPA/Mobile)
                      </SelectItem>
                      <SelectItem value="oidc-confidential">
                        OIDC Confidential (Server)
                      </SelectItem>
                      <SelectItem value="mcp-client">
                        MCP Agent Client
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oa-redirect">Redirect URI</Label>
              <Input id="oa-redirect" {...oauthForm.register("redirectUri")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oa-scopes">Scopes (pisahkan spasi)</Label>
              <Input id="oa-scopes" {...oauthForm.register("scopesText")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="oa-pkce">Wajibkan PKCE (S256)</Label>
              <Controller
                control={oauthForm.control}
                name="pkceRequired"
                render={({ field }) => (
                  <Switch
                    id="oa-pkce"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                onClick={() => setCreateClientOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" color="primary">
                Daftarkan Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add SSO Provider Dialog */}
      <Dialog open={createSsoOpen} onOpenChange={setCreateSsoOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Tambah Enterprise SSO Provider</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={ssoForm.handleSubmit((vals) =>
              createSsoMutation.mutate(vals),
            )}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="sso-name">Nama Provider</Label>
              <Input
                id="sso-name"
                placeholder="Mis. Okta Corporate"
                {...ssoForm.register("name")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Protokol</Label>
                <Controller
                  control={ssoForm.control}
                  name="protocol"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saml2">SAML 2.0</SelectItem>
                        <SelectItem value="oidc">OIDC</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sso-domain">Domain Email</Label>
                <Input
                  id="sso-domain"
                  placeholder="perusahaan.com"
                  {...ssoForm.register("domain")}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sso-org">Organisasi</Label>
              <Input id="sso-org" {...ssoForm.register("organizationName")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="sso-scim">Aktifkan SCIM 2.0 Provisioning</Label>
              <Controller
                control={ssoForm.control}
                name="scimEnabled"
                render={({ field }) => (
                  <Switch
                    id="sso-scim"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                onClick={() => setCreateSsoOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" color="primary">
                Simpan Provider
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

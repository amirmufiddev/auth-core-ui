import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, type SortingState } from "@tanstack/react-table";
import {
  Ban,
  CheckCircle2,
  Eye,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users as UsersIcon,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  banOrUnbanUser,
  createUser,
  deleteUser,
  listRoles,
  listUsers,
  updateUser,
} from "@/api/auth-service";
import { type AuthUserRecord } from "@/api/mock-db";
import { formatDate } from "@/lib/utils";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  type BanUserValues,
  type UserFormValues,
  type UsersSearchParams,
  banUserSchema,
  userFormSchema,
} from "@/features/users/schema";
import { FeatureDisabledCard } from "@/components/layout/FeatureDisabledCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UsersPageProps {
  searchParams: UsersSearchParams;
  onUpdateSearch: (patch: Partial<UsersSearchParams>) => void;
}

export function UsersPage({ searchParams, onUpdateSearch }: UsersPageProps) {
  const queryClient = useQueryClient();
  const isAdminEnabled = useAuthConfigStore((s) => s.isFeatureEnabled("admin"));
  const impersonateUser = useAuthStore((s) => s.impersonateUser);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUserRecord | null>(null);
  const [banTarget, setBanTarget] = useState<AuthUserRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthUserRecord | null>(null);
  const [inspectTarget, setInspectTarget] = useState<AuthUserRecord | null>(
    null,
  );

  const sorting: SortingState = searchParams.sortBy
    ? [{ id: searchParams.sortBy, desc: searchParams.sortDir === "desc" }]
    : [];

  const usersQuery = useQuery({
    queryKey: ["users", searchParams],
    queryFn: () =>
      listUsers({
        page: searchParams.page,
        pageSize: searchParams.pageSize,
        search: searchParams.search,
        role: searchParams.role,
        status: searchParams.status,
        sortBy: searchParams.sortBy,
        sortDir: searchParams.sortDir,
      }),
    enabled: isAdminEnabled,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: listRoles,
  });

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      role: "user",
      organizationName: "Auth Core HQ",
      emailVerified: true,
      twoFactorEnabled: false,
    },
  });

  const banForm = useForm<BanUserValues>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      banReason: "",
      banExpires: undefined,
    },
  });

  const saveUserMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      if (editingUser) {
        return updateUser(editingUser.id, values);
      }
      return createUser(values);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success(
        editingUser ? "Data user diperbarui." : "User baru berhasil dibuat.",
      );
      setUserModalOpen(false);
      setEditingUser(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan user.");
    },
  });

  const banMutation = useMutation({
    mutationFn: banOrUnbanUser,
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        updated.banned
          ? `User ${updated.email} dibekukan.`
          : `User ${updated.email} dipulihkan.`,
      );
      setBanTarget(null);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Gagal memperbarui ban.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("User berhasil dihapus.");
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus user.");
    },
  });

  const openCreateModal = () => {
    setEditingUser(null);
    userForm.reset({
      name: "",
      email: "",
      username: "",
      role: "user",
      organizationName: "Auth Core HQ",
      emailVerified: true,
      twoFactorEnabled: false,
    });
    setUserModalOpen(true);
  };

  const openEditModal = (user: AuthUserRecord) => {
    setEditingUser(user);
    userForm.reset({
      name: user.name,
      email: user.email,
      username: user.username ?? "",
      role: user.role,
      organizationName: user.organizationName ?? "Auth Core HQ",
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    });
    setUserModalOpen(true);
  };

  if (!isAdminEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Users Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Modul administrasi akun pengguna berbasis modul Admin Auth Core.
          </p>
        </div>
        <FeatureDisabledCard featureId="admin" />
      </div>
    );
  }

  const users = usersQuery.data?.items ?? [];
  const totalUsers = usersQuery.data?.total ?? 0;
  const bannedCount = users.filter((u) => u.banned).length;
  const twoFactorCount = users.filter((u) => u.twoFactorEnabled).length;
  const verifiedCount = users.filter((u) => u.emailVerified).length;

  const columns: ColumnDef<AuthUserRecord>[] = [
    {
      accessorKey: "name",
      header: "Pengguna",
      cell: ({ row }) => {
        const u = row.original;
        const initials = u.name
          .split(" ")
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase() ?? "")
          .join("");
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/12 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-semibold text-default-900">
                {u.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {u.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge
          color={row.original.role.includes("admin") ? "default" : "secondary"}
          variant="soft"
          className="font-semiboldums text-xs"
        >
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "banned",
      header: "Status",
      cell: ({ row }) => {
        const u = row.original;
        if (u.banned) {
          return (
            <Badge color="destructive" variant="soft">
              Banned
            </Badge>
          );
        }
        if (!u.emailVerified) {
          return (
            <Badge color="warning" variant="soft">
              Unverified
            </Badge>
          );
        }
        return (
          <Badge color="success" variant="soft">
            Active
          </Badge>
        );
      },
    },
    {
      accessorKey: "twoFactorEnabled",
      header: "Keamanan",
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              color={u.twoFactorEnabled ? "success" : "secondary"}
              variant="outline"
              className="text-[11px]"
            >
              {u.twoFactorEnabled ? "2FA On" : "No 2FA"}
            </Badge>
            {u.passkeyCount > 0 && (
              <Badge color="info" variant="soft" className="text-[11px]">
                {u.passkeyCount} Passkey
              </Badge>
            )}
          </div>
        );
      },
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
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  color="secondary"
                  className="h-8 w-8"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setInspectTarget(u)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Detail & Keamanan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditModal(u)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await impersonateUser(u);
                    toast.info(`Mengimpersonasi ${u.email}`);
                  }}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Impersonate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {u.banned ? (
                  <DropdownMenuItem
                    onClick={() =>
                      banMutation.mutate({ userId: u.id, banned: false })
                    }
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                    Unban User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      banForm.reset({ banReason: "", banExpires: undefined });
                      setBanTarget(u);
                    }}
                    className="text-warning focus:text-warning"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Ban User
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setDeleteTarget(u)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Users Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola akun pengguna, role RBAC, 2FA, ban/unban, dan impersonation.
          </p>
        </div>
        <Button color="primary" onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Cocok Filter</span>
              <UsersIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {totalUsers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Email Terverifikasi (Halaman)</span>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {verifiedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>2FA Aktif (Halaman)</span>
              <ShieldCheck className="h-4 w-4 text-info" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {twoFactorCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Banned (Halaman)</span>
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </div>
            <div className="mt-2 text-2xl font-bold text-default-900">
              {bannedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table / Grid */}
      <Card>
        <CardHeader className="mb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">
            Direktori Pengguna Auth Core
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={searchParams.role}
              onValueChange={(value) =>
                onUpdateSearch({ role: value, page: 0 })
              }
            >
              <SelectTrigger className="h-9 w-40" size="sm">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                {(rolesQuery.data ?? []).map((r) => (
                  <SelectItem key={r.id} value={r.slug}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchParams.status}
              onValueChange={(value) =>
                onUpdateSearch({
                  status: value as UsersSearchParams["status"],
                  page: 0,
                })
              }
            >
              <SelectTrigger className="h-9 w-36" size="sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center rounded-md border border-border p-0.5">
              <Button
                type="button"
                size="icon"
                variant={searchParams.view === "list" ? undefined : "ghost"}
                color={searchParams.view === "list" ? "primary" : "secondary"}
                className="h-7 w-7"
                onClick={() => onUpdateSearch({ view: "list" })}
                aria-label="Tampilan tabel"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant={searchParams.view === "grid" ? undefined : "ghost"}
                color={searchParams.view === "grid" ? "primary" : "secondary"}
                className="h-7 w-7"
                onClick={() => onUpdateSearch({ view: "grid" })}
                aria-label="Tampilan grid"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {searchParams.view === "list" ? (
            <DataTable
              columns={columns}
              data={users}
              totalCount={totalUsers}
              pageIndex={searchParams.page}
              pageSize={searchParams.pageSize}
              onPaginationChange={(next) =>
                onUpdateSearch({
                  page: next.pageIndex,
                  pageSize: next.pageSize,
                })
              }
              sorting={sorting}
              onSortingChange={(updater) => {
                const next =
                  typeof updater === "function" ? updater(sorting) : updater;
                const first = next[0];
                onUpdateSearch({
                  sortBy: first?.id ?? "createdAt",
                  sortDir: first?.desc ? "desc" : "asc",
                });
              }}
              searchValue={searchParams.search}
              onSearchChange={(val) => onUpdateSearch({ search: val, page: 0 })}
              searchPlaceholder="Cari nama, email, username..."
              isLoading={usersQuery.isLoading}
            />
          ) : (
            <div className="space-y-4 p-4">
              <Input
                value={searchParams.search}
                onChange={(e) =>
                  onUpdateSearch({ search: e.target.value, page: 0 })
                }
                placeholder="Cari nama, email, username..."
                className="max-w-xs"
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {users.map((u) => (
                  <Card key={u.id} className="border border-border">
                    <CardContent className="space-y-4 pt-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-default-900">
                            {u.name}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {u.email}
                          </div>
                        </div>
                        <Badge
                          color={u.banned ? "destructive" : "success"}
                          variant="soft"
                        >
                          {u.banned ? "Banned" : "Active"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge color="default" variant="soft">
                          {u.role}
                        </Badge>
                        {u.twoFactorEnabled && (
                          <Badge color="info" variant="outline">
                            2FA
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          color="secondary"
                          onClick={() => setInspectTarget(u)}
                        >
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="soft"
                          color="primary"
                          onClick={() => openEditModal(u)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
            <DialogDescription>
              Tervalidasi dengan Zod & dikirim lewat TanStack Query mutation.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={userForm.handleSubmit((vals) =>
              saveUserMutation.mutate(vals),
            )}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="usr-name">Nama Lengkap</Label>
                <Input id="usr-name" {...userForm.register("name")} />
                {userForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {userForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-username">Username</Label>
                <Input id="usr-username" {...userForm.register("username")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="usr-email">Email</Label>
              <Input
                id="usr-email"
                type="email"
                {...userForm.register("email")}
              />
              {userForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {userForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Role RBAC</Label>
                <Controller
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        {(rolesQuery.data ?? []).map((r) => (
                          <SelectItem key={r.id} value={r.slug}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-org">Organisasi</Label>
                <Input
                  id="usr-org"
                  {...userForm.register("organizationName")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="usr-verified" className="cursor-pointer">
                  Email Terverifikasi
                </Label>
                <Controller
                  control={userForm.control}
                  name="emailVerified"
                  render={({ field }) => (
                    <Switch
                      id="usr-verified"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="usr-2fa" className="cursor-pointer">
                  Wajibkan Two-Factor Auth (2FA)
                </Label>
                <Controller
                  control={userForm.control}
                  name="twoFactorEnabled"
                  render={({ field }) => (
                    <Switch
                      id="usr-2fa"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                onClick={() => setUserModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={saveUserMutation.isPending}
              >
                {saveUserMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog
        open={Boolean(banTarget)}
        onOpenChange={(open) => !open && setBanTarget(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Bekukan Akun ({banTarget?.email})</DialogTitle>
            <DialogDescription>
              User yang dibekukan akan otomatis ditolak oleh sistem Auth Core
              plugin hingga masa berlaku berakhir.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={banForm.handleSubmit((vals) => {
              if (!banTarget) return;
              banMutation.mutate({
                userId: banTarget.id,
                banned: true,
                banReason: vals.banReason,
                banExpires: vals.banExpires?.toISOString(),
              });
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="ban-reason">Alasan Pembekuan</Label>
              <Textarea
                id="ban-reason"
                placeholder="Mis. Percobaan brute-force berulang..."
                {...banForm.register("banReason")}
              />
              {banForm.formState.errors.banReason && (
                <p className="text-xs text-destructive">
                  {banForm.formState.errors.banReason.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Berakhir Pada (Opsional)</Label>
              <Controller
                control={banForm.control}
                name="banExpires"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Permanen jika dikosongkan"
                  />
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                onClick={() => setBanTarget(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                color="destructive"
                disabled={banMutation.isPending}
              >
                Konfirmasi Ban
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Security Detail Sheet */}
      <Sheet
        open={Boolean(inspectTarget)}
        onOpenChange={(open) => !open && setInspectTarget(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {inspectTarget && (
            <>
              <SheetHeader>
                <SheetTitle>{inspectTarget.name}</SheetTitle>
                <SheetDescription>{inspectTarget.email}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color="default" variant="soft">
                    {inspectTarget.role}
                  </Badge>
                  <Badge
                    color={inspectTarget.banned ? "destructive" : "success"}
                    variant="soft"
                  >
                    {inspectTarget.banned ? "Banned" : "Active"}
                  </Badge>
                  <Badge color="info" variant="outline">
                    Last login: {inspectTarget.lastLoginMethod}
                  </Badge>
                </div>

                <Tabs defaultValue="security">
                  <TabsList className="w-full">
                    <TabsTrigger value="security" className="flex-1">
                      Kebijakan Keamanan
                    </TabsTrigger>
                    <TabsTrigger value="meta" className="flex-1">
                      Metadata & Organisasi
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="security" className="space-y-3 pt-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <div className="text-sm font-medium text-default-900">
                          Two-Factor Authentication
                        </div>
                        <div className="text-xs text-muted-foreground">
                          TOTP / Backup Codes
                        </div>
                      </div>
                      <Switch
                        checked={inspectTarget.twoFactorEnabled}
                        onCheckedChange={(checked) => {
                          saveUserMutation.mutate({
                            name: inspectTarget.name,
                            email: inspectTarget.email,
                            username: inspectTarget.username,
                            role: inspectTarget.role,
                            organizationName: inspectTarget.organizationName,
                            emailVerified: inspectTarget.emailVerified,
                            twoFactorEnabled: checked,
                          });
                          setInspectTarget({
                            ...inspectTarget,
                            twoFactorEnabled: checked,
                          });
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <div className="text-sm font-medium text-default-900">
                          Email Verified
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Status verifikasi email akun
                        </div>
                      </div>
                      <Switch
                        checked={inspectTarget.emailVerified}
                        onCheckedChange={(checked) => {
                          saveUserMutation.mutate({
                            name: inspectTarget.name,
                            email: inspectTarget.email,
                            username: inspectTarget.username,
                            role: inspectTarget.role,
                            organizationName: inspectTarget.organizationName,
                            emailVerified: checked,
                            twoFactorEnabled: inspectTarget.twoFactorEnabled,
                          });
                          setInspectTarget({
                            ...inspectTarget,
                            emailVerified: checked,
                          });
                        }}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="meta" className="space-y-3 pt-4 text-sm">
                    <div className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID</span>
                        <span className="tabular-nums text-xs">
                          {inspectTarget.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Username</span>
                        <span className="font-semiboldums text-xs">
                          {inspectTarget.username ?? "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Organisasi
                        </span>
                        <span>{inspectTarget.organizationName ?? "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Terdaftar</span>
                        <span>{formatDate(inspectTarget.createdAt)}</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun <span className="font-semibold">{deleteTarget?.email}</span>{" "}
              beserta seluruh sesi aktifnya akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

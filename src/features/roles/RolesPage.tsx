import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  Code2,
  Copy,
  Lock,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import {
  createRole,
  deleteRole,
  listRoles,
  updateRolePermissions,
} from "@/api/auth-service";
import {
  RBAC_RESOURCE_MODULES,
  type RbacResource,
  type RolePermissionMatrix,
  type RoleRecord,
  countRolePermissions,
  generateAccessControlCode,
  getTotalAvailablePermissions,
} from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import {
  type CreateRoleValues,
  createRoleSchema,
} from "@/features/roles/schema";
import { FeatureDisabledCard } from "@/components/layout/FeatureDisabledCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function RolesPage() {
  const queryClient = useQueryClient();
  const isAdminEnabled = useAuthConfigStore((s) => s.isFeatureEnabled("admin"));

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: listRoles,
  });

  const roles = rolesQuery.data ?? [];
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftPermissions, setDraftPermissions] = useState<RolePermissionMatrix>(
    {}
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleRecord | null>(null);

  const selectedRole =
    roles.find((r) => r.id === selectedRoleId) ?? roles[0] ?? null;

  useEffect(() => {
    if (!selectedRole) return;
    if (!selectedRoleId) {
      setSelectedRoleId(selectedRole.id);
    }
    setDraftName(selectedRole.name);
    setDraftDescription(selectedRole.description);
    setDraftPermissions(structuredClone(selectedRole.permissions));
  }, [selectedRole, selectedRoleId]);

  const createForm = useForm<CreateRoleValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: "", slug: "", description: "" },
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      setSelectedRoleId(created.id);
      setCreateOpen(false);
      createForm.reset();
      toast.success(`Role "${created.name}" berhasil dibuat.`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal membuat role.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRolePermissions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Matriks permission RBAC berhasil disimpan.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan role.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      setSelectedRoleId("");
      setDeleteTarget(null);
      toast.success("Role berhasil dihapus.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus role.");
    },
  });

  const togglePermission = (
    resource: RbacResource,
    action: string,
    checked: boolean
  ) => {
    setDraftPermissions((prev) => {
      const current = new Set(prev[resource] ?? []);
      if (checked) {
        current.add(action);
      } else {
        current.delete(action);
      }
      return {
        ...prev,
        [resource]: Array.from(current),
      };
    });
  };

  const selectAllPermissions = () => {
    const next: RolePermissionMatrix = {};
    for (const mod of RBAC_RESOURCE_MODULES) {
      next[mod.resource] = mod.permissions.map((p) => p.action);
    }
    setDraftPermissions(next);
  };

  const clearAllPermissions = () => {
    setDraftPermissions({});
  };

  if (!isAdminEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Roles & RBAC Permissions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Editor access control Better Auth Admin & Organization.
          </p>
        </div>
        <FeatureDisabledCard featureId="admin" />
      </div>
    );
  }

  const totalAvailable = getTotalAvailablePermissions();
  const activeCount = countRolePermissions(draftPermissions);
  const generatedCode = generateAccessControlCode(
    roles.map((r) =>
      r.id === selectedRole?.id
        ? {
            ...r,
            name: draftName,
            description: draftDescription,
            permissions: draftPermissions,
          }
        : r
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Roles & RBAC Permissions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Definisikan statement dan matriks izin berbasis Better Auth{" "}
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
              createAccessControl
            </span>
            .
          </p>
        </div>
        <Button color="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Role Baru
        </Button>
      </div>

      {/* Split Workspace: 12 cols -> 4 left / 8 right */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Master List (Left) */}
        <Card className="lg:col-span-4">
          <CardHeader className="mb-0">
            <CardTitle className="text-base font-semibold">
              Daftar Role ({roles.length})
            </CardTitle>
            <CardDescription>
              Pilih role untuk mengatur hak akses per modul.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              const permCount = countRolePermissions(role.permissions);
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedRoleId(role.id);
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3.5 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/8"
                      : "border-border bg-card hover:bg-accent/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-default-900">
                          {role.name}
                        </span>
                        {role.isSystem && (
                          <Badge
                            color="secondary"
                            variant="soft"
                            className="text-[10px]"
                          >
                            <Lock className="mr-1 h-2.5 w-2.5" />
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                    {!role.isSystem && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        color="destructive"
                        className="h-7 w-7 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(role);
                        }}
                        aria-label={`Hapus role ${role.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-mono">{role.slug}</span>
                    <span>
                      {permCount}/{totalAvailable} izin · {role.userCount} user
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Detail Editor (Right) */}
        <Card className="lg:col-span-8">
          {selectedRole ? (
            <>
              <CardHeader className="mb-0 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-semibold">
                      {selectedRole.name}
                    </CardTitle>
                    <Badge color="default" variant="soft" className="font-mono">
                      {activeCount}/{totalAvailable} permissions
                    </Badge>
                  </div>
                  <CardDescription>
                    Slug:{" "}
                    <span className="font-mono text-xs">{selectedRole.slug}</span>
                  </CardDescription>
                </div>

                <Button
                  color="primary"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      roleId: selectedRole.id,
                      name: draftName,
                      description: draftDescription,
                      permissions: draftPermissions,
                    })
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? "Menyimpan..." : "Simpan Matriks"}
                </Button>
              </CardHeader>

              <CardContent className="pt-5">
                <Tabs defaultValue="matrix">
                  <TabsList>
                    <TabsTrigger value="matrix">
                      <CheckSquare className="mr-1.5 h-3.5 w-3.5" />
                      Assign Access Control
                    </TabsTrigger>
                    <TabsTrigger value="code">
                      <Code2 className="mr-1.5 h-3.5 w-3.5" />
                      Access Control Code
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="matrix" className="space-y-5 pt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="role-edit-name">Nama Role</Label>
                        <Input
                          id="role-edit-name"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="role-edit-desc">Deskripsi</Label>
                        <Input
                          id="role-edit-desc"
                          value={draftDescription}
                          onChange={(e) => setDraftDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                      <span className="text-xs text-muted-foreground">
                        Aksi cepat seluruh resource Better Auth
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          color="secondary"
                          onClick={selectAllPermissions}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          color="destructive"
                          onClick={clearAllPermissions}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    <Accordion
                      type="multiple"
                      defaultValue={["user", "role", "authConfig"]}
                      className="space-y-3"
                    >
                      {RBAC_RESOURCE_MODULES.map((mod) => {
                        const checkedActions = draftPermissions[mod.resource] ?? [];
                        const checkedCount = checkedActions.length;
                        const totalCount = mod.permissions.length;
                        return (
                          <AccordionItem
                            key={mod.resource}
                            value={mod.resource}
                            className="rounded-lg border border-border px-4"
                          >
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex flex-1 items-center justify-between pr-3 text-left">
                                <div>
                                  <div className="text-sm font-semibold text-default-900">
                                    {mod.title}
                                  </div>
                                  <div className="text-xs font-normal text-muted-foreground">
                                    {mod.description}
                                  </div>
                                </div>
                                <Badge
                                  color={
                                    checkedCount === totalCount
                                      ? "success"
                                      : checkedCount > 0
                                        ? "default"
                                        : "secondary"
                                  }
                                  variant="soft"
                                  className="ml-2 shrink-0 font-mono text-xs"
                                >
                                  {checkedCount} / {totalCount}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2">
                                {mod.permissions.map((perm) => {
                                  const checkboxId = `perm-${mod.resource}-${perm.action}`;
                                  const isChecked = checkedActions.includes(
                                    perm.action
                                  );
                                  return (
                                    <div
                                      key={perm.action}
                                      className="flex items-start gap-3 rounded-md border border-border bg-background p-3"
                                    >
                                      <Checkbox
                                        id={checkboxId}
                                        checked={isChecked}
                                        onCheckedChange={(val) =>
                                          togglePermission(
                                            mod.resource,
                                            perm.action,
                                            Boolean(val)
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={checkboxId}
                                        className="cursor-pointer space-y-0.5 leading-snug"
                                      >
                                        <div className="text-xs font-semibold text-default-900">
                                          {perm.label}{" "}
                                          <span className="ml-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                            {mod.resource}:{perm.action}
                                          </span>
                                        </div>
                                        <div className="text-[11px] font-normal text-muted-foreground">
                                          {perm.description}
                                        </div>
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </TabsContent>

                  <TabsContent value="code" className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Generated{" "}
                        <span className="font-mono">permissions.ts</span> untuk
                        Better Auth Admin & Organization plugin.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        color="secondary"
                        onClick={async () => {
                          await navigator.clipboard.writeText(generatedCode);
                          toast.success("Kode Access Control disalin.");
                        }}
                      >
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Salin Kode
                      </Button>
                    </div>
                    <pre className="max-h-[480px] overflow-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs text-default-900">
                      <code>{generatedCode}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="py-12 text-center text-muted-foreground">
              Pilih role di panel kiri untuk mulai mengedit permission.
            </CardContent>
          )}
        </Card>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Buat Role RBAC Baru</DialogTitle>
            <DialogDescription>
              Role kustom dapat langsung ditetapkan ke pengguna dan dikonfigurasi
              izinnya.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit((vals) =>
              createMutation.mutate(vals)
            )}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="new-role-name">Nama Role</Label>
              <Input
                id="new-role-name"
                placeholder="Mis. Billing Operator"
                {...createForm.register("name")}
              />
              {createForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-role-slug">Slug Identifier</Label>
              <Input
                id="new-role-slug"
                placeholder="billing_operator"
                className="font-mono"
                {...createForm.register("slug")}
              />
              {createForm.formState.errors.slug && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.slug.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-role-desc">Deskripsi</Label>
              <Textarea
                id="new-role-desc"
                placeholder="Jelaskan tanggung jawab role ini..."
                {...createForm.register("description")}
              />
              {createForm.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.description.message}
                </p>
              )}
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
              <Button
                type="submit"
                color="primary"
                disabled={createMutation.isPending}
              >
                Buat Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirm */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Role kustom ini akan dihapus dari daftar role AuthCore.
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
              Hapus Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { deleteOrganization, updateOrganization } from "@/api/auth-service";
import { type OrganizationRecord } from "@/api/mock-db";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";

const updateOrgSchema = z.object({
  name: z.string().min(2, "Nama organisasi minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  plan: z.enum(["Free", "Pro", "Enterprise"]),
  ssoEnabled: z.boolean(),
});

export function OrganizationSettingsCards({
  organization,
  onUpdated,
  onDeleted,
}: {
  organization: OrganizationRecord;
  onUpdated?: (org: OrganizationRecord) => void;
  onDeleted?: () => void;
}) {
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<z.infer<typeof updateOrgSchema>>({
    resolver: zodResolver(updateOrgSchema),
    values: {
      name: organization.name,
      slug: organization.slug,
      plan: organization.plan,
      ssoEnabled: organization.ssoEnabled,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vals: z.infer<typeof updateOrgSchema>) =>
      updateOrganization(organization.id, vals),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      void queryClient.invalidateQueries({
        queryKey: ["organizations-switcher"],
      });
      onUpdated?.(updated);
      toast.success("Pengaturan organisasi diperbarui.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOrganization(organization.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      void queryClient.invalidateQueries({
        queryKey: ["organizations-switcher"],
      });
      setDeleteOpen(false);
      onDeleted?.();
      toast.success("Organisasi dihapus.");
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="mb-0">
          <CardTitle className="text-base font-semibold">
            Profil & Kebijakan Tenant
          </CardTitle>
          <CardDescription>
            Perbarui identitas organisasi, paket, dan penegakan SSO.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={form.handleSubmit((vals) => updateMutation.mutate(vals))}
        >
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="ba-org-edit-name">Nama Organisasi</Label>
              <Input id="ba-org-edit-name" {...form.register("name")} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ba-org-edit-slug">Slug</Label>
                <Input
                  id="ba-org-edit-slug"
                  className="font-mono"
                  {...form.register("slug")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Plan</Label>
                <Controller
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="ba-org-edit-sso">Enforce SAML/OIDC SSO</Label>
              <Controller
                control={form.control}
                name="ssoEnabled"
                render={({ field }) => (
                  <Switch
                    id="ba-org-edit-sso"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-border pt-4">
            <Button
              type="submit"
              size="sm"
              color="primary"
              disabled={updateMutation.isPending}
            >
              Simpan Perubahan
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader className="mb-0">
          <CardTitle className="text-base font-semibold text-destructive">
            Hapus Organisasi
          </CardTitle>
          <CardDescription>
            Menghapus tenant ini beserta seluruh anggota & undangannya.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-end pt-4">
          <Button
            type="button"
            size="sm"
            color="destructive"
            variant="outline"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Hapus Organisasi
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus Organisasi &ldquo;{organization.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini permanen dan akan memutus semua akses anggota tenant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { createOrganization } from "@/api/auth-service";
import { type OrganizationRecord } from "@/api/mock-db";
import {
  type CreateOrgValues,
  createOrgSchema,
} from "@/features/organizations/schema";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

export interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (org: OrganizationRecord) => void;
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateOrganizationDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateOrgValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: "",
      slug: "",
      plan: "Pro",
      ssoEnabled: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      void queryClient.invalidateQueries({
        queryKey: ["organizations-switcher"],
      });
      form.reset();
      onOpenChange(false);
      onCreated?.(created);
      toast.success(`Organisasi "${created.name}" berhasil dibuat.`);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Gagal membuat organisasi."
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Buat Organisasi Baru</DialogTitle>
          <DialogDescription>
            Mendaftarkan tenant multi-organisasi pada Better Auth.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((vals) => createMutation.mutate(vals))}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="ba-org-name">Nama Organisasi</Label>
            <Input
              id="ba-org-name"
              placeholder="Mis. PT Galonin Digital"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ba-org-slug">Slug</Label>
            <Input
              id="ba-org-slug"
              placeholder="galonin-digital"
              {...form.register("slug")}
            />
            {form.formState.errors.slug && (
              <p className="text-xs text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
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

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="ba-org-sso">Aktifkan SSO Enforcement</Label>
            <Controller
              control={form.control}
              name="ssoEnabled"
              render={({ field }) => (
                <Switch
                  id="ba-org-sso"
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
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan Organisasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

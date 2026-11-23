import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MailPlus, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  cancelOrganizationInvitation,
  inviteOrganizationMember,
} from "@/api/auth-service";
import { type OrganizationRecord } from "@/api/mock-db";
import { formatDate } from "@/lib/utils";
import {
  type InviteOrgMemberValues,
  inviteOrgMemberSchema,
} from "@/features/organizations/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function OrganizationInvitationsCard({
  organization,
  onUpdated,
}: {
  organization: OrganizationRecord;
  onUpdated?: (org: OrganizationRecord) => void;
}) {
  const queryClient = useQueryClient();

  const inviteForm = useForm<InviteOrgMemberValues>({
    resolver: zodResolver(inviteOrgMemberSchema),
    defaultValues: { email: "", role: "member" },
  });

  const inviteMutation = useMutation({
    mutationFn: inviteOrganizationMember,
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      onUpdated?.(updated);
      inviteForm.reset();
      toast.success("Undangan member berhasil dikirim.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal mengundang.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrganizationInvitation,
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      onUpdated?.(updated);
      toast.info("Undangan dibatalkan.");
    },
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={inviteForm.handleSubmit((vals) =>
          inviteMutation.mutate({
            organizationId: organization.id,
            email: vals.email,
            role: vals.role,
          }),
        )}
        className="space-y-3 rounded-lg border border-border bg-muted/40 p-3"
      >
        <div className="text-xs font-semibold text-default-900">
          Undang Anggota Baru
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input
            placeholder="email@perusahaan.com"
            className="sm:col-span-2"
            {...inviteForm.register("email")}
          />
          <Controller
            control={inviteForm.control}
            name="role"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          color="primary"
          disabled={inviteMutation.isPending}
        >
          <MailPlus className="mr-1.5 h-3.5 w-3.5" />
          Kirim Undangan
        </Button>
      </form>

      {organization.invitations.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          Belum ada undangan tertunda.
        </p>
      ) : (
        organization.invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div>
              <div className="text-sm font-medium text-default-900">
                {inv.email}
              </div>
              <div className="text-xs text-muted-foreground">
                Role: {inv.role} · Exp {formatDate(inv.expiresAt)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge color="warning" variant="soft">
                {inv.status}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                color="secondary"
                className="h-7 w-7"
                onClick={() =>
                  cancelMutation.mutate({
                    organizationId: organization.id,
                    invitationId: inv.id,
                  })
                }
                aria-label="Batalkan undangan"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

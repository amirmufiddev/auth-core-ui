import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import {
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "@/api/auth-service";
import { type OrganizationRecord } from "@/api/mock-db";
import { UserAvatar } from "@/components/better-auth/user/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function OrganizationMembersCard({
  organization,
  onUpdated,
}: {
  organization: OrganizationRecord;
  onUpdated?: (org: OrganizationRecord) => void;
}) {
  const queryClient = useQueryClient();

  const roleMutation = useMutation({
    mutationFn: updateOrganizationMemberRole,
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      onUpdated?.(updated);
      toast.success("Peran anggota diperbarui.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeOrganizationMember,
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      onUpdated?.(updated);
      toast.success("Anggota dikeluarkan dari organisasi.");
    },
  });

  return (
    <div className="space-y-3">
      {organization.members.map((member) => (
        <div
          key={member.id}
          className="flex flex-col justify-between gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              user={{ name: member.name, email: member.email }}
              size="sm"
            />
            <div>
              <div className="text-sm font-semibold text-default-900">
                {member.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {member.email} · {member.teamName ?? "No team"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={member.role}
              onValueChange={(val) =>
                roleMutation.mutate({
                  organizationId: organization.id,
                  memberId: member.id,
                  role: val as "owner" | "admin" | "member",
                })
              }
            >
              <SelectTrigger className="h-8 w-28" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="icon"
              variant="ghost"
              color="destructive"
              className="h-8 w-8"
              disabled={member.role === "owner" || removeMutation.isPending}
              onClick={() =>
                removeMutation.mutate({
                  organizationId: organization.id,
                  memberId: member.id,
                })
              }
              aria-label="Keluarkan anggota"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

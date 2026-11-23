import { type OrganizationRecord } from "@/api/mock-db";
import { formatDate } from "@/lib/utils";
import { OrganizationInvitationsCard } from "@/components/better-auth/organization/OrganizationInvitationsCard";
import { OrganizationMembersCard } from "@/components/better-auth/organization/OrganizationMembersCard";
import { OrganizationSettingsCards } from "@/components/better-auth/organization/OrganizationSettingsCards";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface OrganizationViewProps {
  organization: OrganizationRecord;
  defaultTab?: "members" | "teams" | "invitations" | "settings";
  onOrganizationUpdated?: (org: OrganizationRecord) => void;
  onOrganizationDeleted?: () => void;
}

export function OrganizationView({
  organization,
  defaultTab = "members",
  onOrganizationUpdated,
  onOrganizationDeleted,
}: OrganizationViewProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full flex-wrap">
        <TabsTrigger value="members" className="flex-1">
          Members ({organization.members.length})
        </TabsTrigger>
        <TabsTrigger value="teams" className="flex-1">
          Teams ({organization.teams.length})
        </TabsTrigger>
        <TabsTrigger value="invitations" className="flex-1">
          Invitations ({organization.invitations.length})
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex-1">
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="members" className="pt-4">
        <OrganizationMembersCard
          organization={organization}
          onUpdated={onOrganizationUpdated}
        />
      </TabsContent>

      <TabsContent value="teams" className="space-y-3 pt-4">
        {organization.teams.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div>
              <div className="text-sm font-semibold text-default-900">
                {t.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Dibuat {formatDate(t.createdAt)}
              </div>
            </div>
            <Badge color="info" variant="soft">
              {t.memberCount} anggota
            </Badge>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="invitations" className="pt-4">
        <OrganizationInvitationsCard
          organization={organization}
          onUpdated={onOrganizationUpdated}
        />
      </TabsContent>

      <TabsContent value="settings" className="pt-4">
        <OrganizationSettingsCards
          organization={organization}
          onUpdated={onOrganizationUpdated}
          onDeleted={onOrganizationDeleted}
        />
      </TabsContent>
    </Tabs>
  );
}

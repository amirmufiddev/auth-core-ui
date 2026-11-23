import { AlertTriangle, SlidersHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  BETTER_AUTH_FEATURE_MAP,
  type BetterAuthFeatureId,
} from "@/config/better-auth.config";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface FeatureDisabledCardProps {
  featureId: BetterAuthFeatureId;
  title?: string;
  description?: string;
}

export function FeatureDisabledCard({
  featureId,
  title,
  description,
}: FeatureDisabledCardProps) {
  const toggleFeature = useAuthConfigStore((s) => s.toggleFeature);
  const def = BETTER_AUTH_FEATURE_MAP[featureId];

  const handleEnable = () => {
    const res = toggleFeature(featureId, true);
    if (res.ok) {
      toast.success(`Fitur "${def?.name ?? featureId}" berhasil diaktifkan.`);
    } else if (res.error) {
      toast.error(res.error);
    }
  };

  return (
    <Card>
      <CardHeader className="mb-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">
            {title ?? def?.name ?? featureId}
          </CardTitle>
          <Badge color="warning" variant="soft">
            Plugin Non-Aktif
          </Badge>
        </div>
        <Badge color="secondary" variant="outline" className="font-semiboldums text-xs">
          {def?.packageName}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Alert color="warning" variant="soft">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <AlertTitle className="text-base">
              Modul Layanan Dinonaktifkan
            </AlertTitle>
            <AlertDescription>
              {description ??
                `Plugin "${def?.name ?? featureId}" saat ini dimatikan pada konfigurasi Auth Core. Endpoint terkait (${def?.endpoints.join(", ")}) diblokir oleh guard service.`}
            </AlertDescription>
          </div>
        </Alert>

        <div className="flex flex-wrap items-center gap-3">
          <Button color="primary" onClick={handleEnable}>
            Aktifkan {def?.name ?? featureId}
          </Button>
          <Button variant="outline" color="secondary" asChild>
            <Link to="/auth-features">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Buka Pengaturan Fitur
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

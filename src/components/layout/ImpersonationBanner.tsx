import { Eye, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ImpersonationBanner() {
  const user = useAuthStore((s) => s.user);
  const impersonatedBy = useAuthStore((s) => s.impersonatedBy);
  const stopImpersonating = useAuthStore((s) => s.stopImpersonating);

  if (!impersonatedBy || !user) return null;

  const handleStop = async () => {
    await stopImpersonating();
    toast.success("Kembali ke sesi admin asli.");
  };

  return (
    <Alert
      color="warning"
      className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-3">
        <Eye className="h-5 w-5 shrink-0 text-warning" />
        <AlertDescription className="text-sm">
          Mode Impersonation aktif: Anda sedang melihat aplikasi sebagai{" "}
          <span className="font-semibold text-default-900">{user.email}</span>{" "}
          (diimpersonasi oleh{" "}
          <span className="font-mono text-xs">{impersonatedBy}</span>).
        </AlertDescription>
      </div>
      <Button
        size="sm"
        color="warning"
        variant="outline"
        onClick={handleStop}
        className="shrink-0"
      >
        <LogOut className="mr-1.5 h-3.5 w-3.5" />
        Hentikan Impersonation
      </Button>
    </Alert>
  );
}

import { Fingerprint } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PasskeyButton({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const { features, navigate } = useAuthUI();
  const signInWithPasskey = useAuthStore((s) => s.signInWithPasskey);

  if (!features.passkey?.enabled) return null;

  return (
    <Button
      type="button"
      variant="outline"
      color="secondary"
      className="w-full"
      onClick={async () => {
        try {
          await signInWithPasskey();
          toast.success("Login Passkey WebAuthn berhasil.");
          navigate(redirectTo);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Passkey gagal.");
        }
      }}
    >
      <Fingerprint className="mr-2 h-4 w-4 text-primary" />
      Masuk dengan Passkey (WebAuthn)
    </Button>
  );
}

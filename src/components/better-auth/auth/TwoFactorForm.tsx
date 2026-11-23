import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type VerifyTwoFactorValues,
  verifyTwoFactorSchema,
} from "@/features/auth/schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function TwoFactorForm({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const { navigate } = useAuthUI();
  const verifyTwoFactor = useAuthStore((s) => s.verifyTwoFactor);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const form = useForm<VerifyTwoFactorValues>({
    resolver: zodResolver(verifyTwoFactorSchema),
    defaultValues: { code: "123456" },
  });

  return (
    <form
      onSubmit={form.handleSubmit(async (vals) => {
        try {
          await verifyTwoFactor(vals.code);
          toast.success("Verifikasi 2FA berhasil.");
          navigate(redirectTo);
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Kode 2FA tidak valid."
          );
        }
      })}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="ba-totp-code">
            {useBackupCode ? "Backup Recovery Code" : "Kode TOTP 6 Digit"}
          </Label>
          <Button
            type="button"
            variant="ghost"
            color="primary"
            size="sm"
            className="h-auto px-1.5 py-0.5 text-xs"
            onClick={() => {
              setUseBackupCode((prev) => !prev);
              form.setValue("code", "");
            }}
          >
            {useBackupCode ? "Gunakan Authenticator" : "Gunakan Backup Code"}
          </Button>
        </div>
        <Input
          id="ba-totp-code"
          placeholder={useBackupCode ? "XXXX-XXXX" : "123456"}
          className="text-center font-mono text-lg tracking-widest"
          {...form.register("code")}
        />
        {form.formState.errors.code && (
          <p className="text-xs text-destructive">
            {form.formState.errors.code.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        color="primary"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        Verifikasi & Lanjutkan
      </Button>
    </form>
  );
}

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthStage } from "@/components/auth/AuthStageContext";
import { AuthMascot } from "@/components/auth/AuthMascot";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function TwoFactorForm({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const { navigate } = useAuthUI();
  const verifyTwoFactor = useAuthStore((s) => s.verifyTwoFactor);
  const { setStage } = useAuthStage();
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setStage(verified ? "verified" : "two-factor");
    return () => setStage("default");
  }, [verified, setStage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) {
      setErrorMsg("Masukkan minimal 6 karakter kode.");
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      setVerified(true);
      window.setTimeout(async () => {
        try {
          await verifyTwoFactor(code);
          toast.success("Verifikasi 2FA berhasil.");
          navigate(redirectTo);
        } catch (err) {
          setVerified(false);
          setIsSubmitting(false);
          setErrorMsg(
            err instanceof Error ? err.message : "Kode 2FA tidak valid."
          );
        }
      }, 950);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err instanceof Error ? err.message : "Kode 2FA tidak valid.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
      <div className="pt-1">
        <AuthMascot
          badgeText={verified ? "Terverifikasi" : "Verifikasi 2FA"}
          verified={verified}
          size="md"
        />
      </div>

      {verified ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-2"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-tertiary text-primary-foreground shadow-lg">
            <Check className="h-7 w-7 stroke-[2.5]" />
          </div>
          <p className="text-sm font-medium text-foreground">
            2FA terkonfirmasi, membuka dashboard...
          </p>
        </motion.div>
      ) : (
        <>
          <div className="flex w-full items-center justify-between">
            <Label htmlFor="ba-totp-code" className="text-xs font-medium">
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
                setCode("");
                setErrorMsg(null);
              }}
            >
              {useBackupCode ? "Gunakan Authenticator" : "Gunakan Backup Code"}
            </Button>
          </div>

          {useBackupCode ? (
            <Input
              id="ba-totp-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="XXXX-XXXX"
              className="h-11 rounded-lg border-border/60 bg-surface-subtle text-center text-base font-semibold tracking-widest tabular-nums focus-visible:bg-card"
            />
          ) : (
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(val) => {
                setCode(val);
                setErrorMsg(null);
              }}
            >
              <InputOTPGroup className="gap-1.5 sm:gap-2">
                <InputOTPSlot index={0} className="size-11 sm:size-12" />
                <InputOTPSlot index={1} className="size-11 sm:size-12" />
                <InputOTPSlot index={2} className="size-11 sm:size-12" />
                <InputOTPSlot index={3} className="size-11 sm:size-12" />
                <InputOTPSlot index={4} className="size-11 sm:size-12" />
                <InputOTPSlot index={5} className="size-11 sm:size-12" />
              </InputOTPGroup>
            </InputOTP>
          )}

          <p
            role="status"
            className="min-h-5 text-center text-xs font-medium text-destructive"
          >
            {errorMsg ?? ""}
          </p>

          <Button
            type="submit"
            color={code.trim().length >= 6 ? "primary" : "secondary"}
            className="h-11 w-full rounded-lg text-sm font-semibold"
            disabled={code.trim().length < 6 || isSubmitting}
          >
            {isSubmitting ? "Memverifikasi..." : "Verifikasi & Lanjutkan"}
          </Button>
        </>
      )}
    </form>
  );
}

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Mail } from "lucide-react";
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

export interface EmailOTPFormProps {
  redirectTo?: string;
  /** Optional callback when step enters/exits full-panel OTP verification mode */
  onStepChange?: (step: "request" | "verify" | "verified") => void;
}

export function EmailOTPForm({
  redirectTo = "/dashboard",
  onStepChange,
}: EmailOTPFormProps) {
  const { features, navigate } = useAuthUI();
  const signInWithOtp = useAuthStore((s) => s.signInWithOtp);
  const { setStage } = useAuthStage();

  const [step, setStep] = useState<"request" | "verify" | "verified">(
    "request",
  );
  const [target, setTarget] = useState("admin@authcore.io");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const emailOtpEnabled = Boolean(features.emailOTP?.enabled);
  const phoneOtpEnabled = Boolean(features.phoneNumber?.enabled);

  useEffect(() => {
    onStepChange?.(step);
    if (step === "verify") {
      setStage("otp");
    } else if (step === "verified") {
      setStage("verified");
    } else {
      setStage("default");
    }
  }, [step, setStage, onStepChange]);

  useEffect(() => {
    return () => {
      setStage("default");
    };
  }, [setStage]);

  if (!emailOtpEnabled && !phoneOtpEnabled) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (target.trim().length < 3) {
      setErrorMsg("Masukkan email atau nomor telepon yang valid.");
      return;
    }
    setErrorMsg(null);
    setOtp("");
    setStep("verify");
    toast.info("Kode OTP demo telah dikirim. Gunakan kode 1234.");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setErrorMsg(null);
    setIsVerifying(true);

    // Brief tactile verification beat for animation smoothness
    await new Promise((r) => setTimeout(r, 550));

    if (otp !== "1234" && otp !== "0000") {
      setIsVerifying(false);
      setOtp("");
      setErrorMsg("Kode OTP tidak sesuai. Coba masukkan 1234.");
      return;
    }

    try {
      const channel =
        phoneOtpEnabled && !target.includes("@") ? "phone" : "email";
      setStep("verified");
      setIsVerifying(false);

      // Show celebratory spin briefly before committing session & redirecting
      window.setTimeout(async () => {
        try {
          await signInWithOtp({
            channel,
            target: target.trim(),
            otp,
          });
          toast.success("Verifikasi OTP berhasil. Selamat datang!");
          navigate(redirectTo);
        } catch (err) {
          setStep("verify");
          setErrorMsg(
            err instanceof Error ? err.message : "Verifikasi OTP gagal.",
          );
        }
      }, 1150);
    } catch (err) {
      setIsVerifying(false);
      setErrorMsg(err instanceof Error ? err.message : "Verifikasi OTP gagal.");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === "request" && (
        <motion.form
          key="otp-request"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          onSubmit={handleSendOtp}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="ba-otp-target" className="text-xs font-medium">
              {phoneOtpEnabled && emailOtpEnabled
                ? "Email atau No. Telepon"
                : phoneOtpEnabled
                  ? "No. Telepon"
                  : "Alamat Email"}
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="ba-otp-target"
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="admin@authcore.io"
                className="h-11 rounded-lg border-border/60 bg-surface-subtle pl-9 focus-visible:bg-card"
              />
            </div>
            {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
          </div>

          <Button
            type="submit"
            color="primary"
            className="h-11 w-full rounded-lg text-sm font-semibold"
          >
            Kirim Kode OTP (4 Digit)
          </Button>
        </motion.form>
      )}

      {step === "verify" && (
        <motion.form
          key="otp-verify"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28 }}
          onSubmit={handleVerifyOtp}
          className="flex w-full flex-col items-center gap-6 text-center"
        >
          {/* Mascot arrives here via layoutId="authcore-mascot" */}
          <div className="pt-2">
            <AuthMascot badgeText="Masukkan OTP" size="lg" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              Cek email Anda
            </h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              Kami mengirim 4 digit kode ke{" "}
              <span className="font-semibold text-foreground">{target}</span>.
              Masukkan di bawah untuk melanjutkan.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <InputOTP
              maxLength={4}
              value={otp}
              disabled={isVerifying}
              onChange={(val) => {
                setOtp(val);
                if (errorMsg) setErrorMsg(null);
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>

            <p
              role="status"
              className="min-h-5 text-xs font-medium text-destructive"
            >
              {errorMsg ?? ""}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Mode demo lokal: gunakan kode{" "}
              <span className="font-semibold text-primary">1234</span>
            </p>
          </div>

          <div className="w-full space-y-3">
            <Button
              type="submit"
              color={otp.length === 4 ? "primary" : "secondary"}
              disabled={otp.length < 4 || isVerifying}
              className="h-11 w-full rounded-lg text-sm font-semibold transition-all"
            >
              {isVerifying ? "Memverifikasi..." : "Verifikasi & Lanjutkan"}
            </Button>

            <div className="text-xs text-muted-foreground">
              Salah alamat email?{" "}
              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setErrorMsg(null);
                }}
                className="inline-flex cursor-pointer items-center gap-1 font-semibold text-foreground hover:text-primary"
              >
                <ArrowLeft className="h-3 w-3" />
                Kembali
              </button>
            </div>
          </div>
        </motion.form>
      )}

      {step === "verified" && (
        <motion.div
          key="otp-verified"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex w-full flex-col items-center gap-6 text-center"
        >
          <div className="pt-2">
            <AuthMascot badgeText="Terverifikasi" verified size="lg" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              Berhasil Diverifikasi
            </h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              Identitas{" "}
              <span className="font-semibold text-foreground">{target}</span>{" "}
              telah dikonfirmasi. Mengarahkan ke Auth Core Console...
            </p>
          </div>

          {/* Floating glossy 3D badge synced to theme tokens */}
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-tertiary text-primary-foreground shadow-lg"
          >
            <span className="pointer-events-none absolute top-1.5 left-1.5 h-2 w-7 rounded-full bg-white/55" />
            <span className="pointer-events-none absolute right-1 bottom-1 size-4 rounded-full bg-white/25" />
            <Check className="relative z-10 h-7 w-7 stroke-[2.5]" />
          </motion.div>

          <Button
            type="button"
            color="primary"
            className="h-11 w-full rounded-lg text-sm font-semibold"
            disabled
          >
            <Check className="mr-2 h-4 w-4" />
            Terverifikasi
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

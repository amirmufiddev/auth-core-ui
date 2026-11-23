import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type OtpLoginValues, otpLoginSchema } from "@/features/auth/schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function EmailOTPForm({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const { features, navigate } = useAuthUI();
  const signInWithOtp = useAuthStore((s) => s.signInWithOtp);
  const [otpSent, setOtpSent] = useState(false);

  const emailOtpEnabled = Boolean(features.emailOTP?.enabled);
  const phoneOtpEnabled = Boolean(features.phoneNumber?.enabled);

  const form = useForm<OtpLoginValues>({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: { target: "admin@authcore.io", otp: "123456" },
  });

  if (!emailOtpEnabled && !phoneOtpEnabled) return null;

  return (
    <form
      onSubmit={form.handleSubmit(async (vals) => {
        try {
          const channel =
            phoneOtpEnabled && !vals.target.includes("@") ? "phone" : "email";
          await signInWithOtp({
            channel,
            target: vals.target,
            otp: vals.otp,
          });
          toast.success("Kode OTP valid. Berhasil masuk.");
          navigate(redirectTo);
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Verifikasi OTP gagal."
          );
        }
      })}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="ba-otp-target">
          {phoneOtpEnabled && emailOtpEnabled
            ? "Email atau No. Telepon"
            : phoneOtpEnabled
              ? "No. Telepon"
              : "Email"}
        </Label>
        <div className="flex gap-2">
          <Input id="ba-otp-target" {...form.register("target")} />
          <Button
            type="button"
            variant="outline"
            color="secondary"
            onClick={() => {
              setOtpSent(true);
              toast.info("Kode OTP demo: 123456");
            }}
          >
            Kirim OTP
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ba-otp-code">Kode OTP</Label>
        <Input
          id="ba-otp-code"
          className="font-mono"
          {...form.register("otp")}
        />
        {otpSent && (
          <p className="text-[11px] text-success">
            OTP dikirim. Gunakan kode 123456 untuk mode lokal.
          </p>
        )}
      </div>

      <Button
        type="submit"
        color="primary"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        Verifikasi OTP & Masuk
      </Button>
    </form>
  );
}

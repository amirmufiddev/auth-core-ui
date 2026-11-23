import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type RegisterValues,
  registerSchema,
} from "@/features/auth/schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SignUpForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const { features, navigate } = useAuthUI();
  const signUp = useAuthStore((s) => s.signUp);

  const usernameEnabled = Boolean(features.username?.enabled);
  const hibpEnabled = Boolean(features.haveIBeenPwned?.enabled);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", username: "", password: "" },
  });

  const onSubmit = async (vals: RegisterValues) => {
    try {
      await signUp(vals);
      toast.success("Akun berhasil dibuat!");
      navigate(redirectTo);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registrasi gagal.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ba-signup-name">Nama Lengkap</Label>
        <Input id="ba-signup-name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ba-signup-email">Email</Label>
        <Input id="ba-signup-email" type="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {usernameEnabled && (
        <div className="space-y-1.5">
          <Label htmlFor="ba-signup-username">Username</Label>
          <Input id="ba-signup-username" {...form.register("username")} />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="ba-signup-password">Kata Sandi</Label>
        <Input
          id="ba-signup-password"
          type="password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
        {hibpEnabled && (
          <p className="text-[11px] text-muted-foreground">
            Dilindungi pengecekan Have I Been Pwned (k-Anonymity).
          </p>
        )}
      </div>

      <Button
        type="submit"
        color="primary"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Mendaftarkan..." : "Daftar Akun"}
      </Button>
    </form>
  );
}

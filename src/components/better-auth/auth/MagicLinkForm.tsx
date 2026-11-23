import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  type MagicLinkValues,
  magicLinkSchema,
} from "@/features/auth/schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function MagicLinkForm({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const { features, navigate } = useAuthUI();
  const signInWithMagicLink = useAuthStore((s) => s.signInWithMagicLink);

  const form = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "admin@authcore.io" },
  });

  if (!features.magicLink?.enabled) return null;

  return (
    <form
      onSubmit={form.handleSubmit(async (vals) => {
        try {
          await signInWithMagicLink(vals.email);
          toast.success("Magic link diverifikasi. Berhasil masuk.");
          navigate(redirectTo);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Magic link gagal.");
        }
      })}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="ba-magic-email">Alamat Email</Label>
        <Input
          id="ba-magic-email"
          type="email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        color="primary"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        <Mail className="mr-2 h-4 w-4" />
        Kirim & Verifikasi Magic Link
      </Button>
    </form>
  );
}

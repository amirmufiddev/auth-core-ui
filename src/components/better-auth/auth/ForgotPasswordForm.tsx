import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type ForgotPasswordValues,
  forgotPasswordSchema,
} from "@/features/auth/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <form
      onSubmit={form.handleSubmit((vals) => {
        toast.success(
          `Tautan reset password dikirim ke ${vals.email} (simulasi lokal).`
        );
      })}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="ba-fp-email">Alamat Email</Label>
        <Input id="ba-fp-email" type="email" {...form.register("email")} />
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
        Kirim Tautan Reset
      </Button>
    </form>
  );
}

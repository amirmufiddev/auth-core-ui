import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { UserAvatar } from "@/components/better-auth/user/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const avatarSchema = z.object({
  avatarUrl: z
    .string()
    .refine(
      (v) => v === "" || /^https?:\/\/.+/.test(v),
      "Masukkan URL gambar yang valid (http/https)",
    ),
});

export function UpdateAvatarCard() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const form = useForm<{ avatarUrl: string }>({
    resolver: zodResolver(avatarSchema),
    values: { avatarUrl: user?.avatarUrl ?? "" },
  });

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="mb-0 flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold">Avatar Akun</CardTitle>
          <CardDescription>
            Perbarui URL foto profil Anda yang tampil di header dan direktori.
          </CardDescription>
        </div>
        <UserAvatar user={user} size="lg" />
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(async (vals) => {
          await updateProfile({ avatarUrl: vals.avatarUrl || undefined });
          toast.success("Avatar diperbarui.");
        })}
      >
        <CardContent className="space-y-2 pt-4">
          <Label htmlFor="ba-avatar-url">URL Avatar</Label>
          <Input
            id="ba-avatar-url"
            placeholder="https://example.com/avatar.png"
            {...form.register("avatarUrl")}
          />
          {form.formState.errors.avatarUrl && (
            <p className="text-xs text-destructive">
              {form.formState.errors.avatarUrl.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            Kosongkan untuk menggunakan inisial nama.
          </span>
          <Button type="submit" size="sm" color="primary">
            Simpan Avatar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  username: z.string().optional(),
});

export function UpdateNameCard() {
  const { features } = useAuthUI();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const usernameEnabled = Boolean(features.username?.enabled);

  const form = useForm<{ name: string; username?: string }>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? "",
      username: user?.username ?? "",
    },
  });

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="mb-0">
        <CardTitle className="text-base font-semibold">
          Identitas Profil
        </CardTitle>
        <CardDescription>
          Perbarui nama tampilan dan username unik akun Auth Core Anda.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(async (vals) => {
          try {
            await updateProfile({
              name: vals.name,
              username: usernameEnabled ? vals.username : undefined,
            });
            toast.success("Profil berhasil diperbarui.");
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Gagal memperbarui profil.",
            );
          }
        })}
      >
        <CardContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ba-profile-name">Nama Lengkap</Label>
            <Input id="ba-profile-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          {usernameEnabled && (
            <div className="space-y-1.5">
              <Label htmlFor="ba-profile-username">Username</Label>
              <Input id="ba-profile-username" {...form.register("username")} />
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t border-border pt-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserCheck className="h-3.5 w-3.5 text-primary" />
            Role aktif:{" "}
            <span className="font-semibold text-foreground">{user.role}</span>
          </span>
          <Button type="submit" size="sm" color="primary">
            Simpan Profil
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

const changeEmailSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export function ChangeEmailCard() {
  const user = useAuthStore((s) => s.user);
  const changeEmail = useAuthStore((s) => s.changeEmail);

  const form = useForm<{ email: string }>({
    resolver: zodResolver(changeEmailSchema),
    values: { email: user?.email ?? "" },
  });

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="mb-0 flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base font-semibold">
            Alamat Email
          </CardTitle>
          <CardDescription>
            Email utama yang digunakan untuk sign-in dan notifikasi keamanan.
          </CardDescription>
        </div>
        <Badge
          color={user.emailVerified ? "success" : "warning"}
          variant="soft"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {user.emailVerified ? "Verified" : "Unverified"}
        </Badge>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(async (vals) => {
          await changeEmail(vals.email);
          toast.success(
            "Email diperbarui. Silakan verifikasi email baru Anda.",
          );
        })}
      >
        <CardContent className="space-y-2 pt-4">
          <Label htmlFor="ba-change-email">Email</Label>
          <Input
            id="ba-change-email"
            type="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t border-border pt-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            Perubahan email memicu verifikasi ulang jika aktif.
          </span>
          <Button type="submit" size="sm" color="primary">
            Ubah Email
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

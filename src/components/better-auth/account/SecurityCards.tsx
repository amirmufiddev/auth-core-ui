import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Copy,
  Fingerprint,
  KeyRound,
  Link2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Unlink,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { SOCIAL_PROVIDER_CATALOG } from "@/components/better-auth/auth/ProviderButtons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(4, "Kata sandi saat ini wajib diisi"),
    newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
    confirmPassword: z.string().min(8, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export function ChangePasswordCard() {
  const { features } = useAuthUI();
  const changePassword = useAuthStore((s) => s.changePassword);
  const hibpEnabled = Boolean(features.haveIBeenPwned?.enabled);

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (!features.emailAndPassword?.enabled) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="mb-0">
        <CardTitle className="text-base font-semibold">
          Ubah Kata Sandi
        </CardTitle>
        <CardDescription>
          Perbarui kata sandi secara berkala untuk menjaga keamanan akun Anda.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(async (vals) => {
          try {
            await changePassword({
              currentPassword: vals.currentPassword,
              newPassword: vals.newPassword,
            });
            form.reset();
            toast.success("Kata sandi berhasil diperbarui.");
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Gagal mengubah password."
            );
          }
        })}
      >
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="ba-cur-pass">Kata Sandi Saat Ini</Label>
            <Input
              id="ba-cur-pass"
              type="password"
              {...form.register("currentPassword")}
            />
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ba-new-pass">Kata Sandi Baru</Label>
              <Input
                id="ba-new-pass"
                type="password"
                {...form.register("newPassword")}
              />
              {form.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ba-conf-pass">Konfirmasi Kata Sandi Baru</Label>
              <Input
                id="ba-conf-pass"
                type="password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          {hibpEnabled && (
            <p className="text-[11px] text-muted-foreground">
              Dilindungi pengecekan kebocoran kata sandi Have I Been Pwned.
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-end border-t border-border pt-4">
          <Button type="submit" size="sm" color="primary">
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            Simpan Kata Sandi
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function TwoFactorCard() {
  const { features } = useAuthUI();
  const user = useAuthStore((s) => s.user);
  const enableTwoFactor = useAuthStore((s) => s.enableTwoFactor);
  const disableTwoFactor = useAuthStore((s) => s.disableTwoFactor);
  const regenerateBackupCodes = useAuthStore((s) => s.regenerateBackupCodes);

  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("password123");
  const [setupInfo, setSetupInfo] = useState<{
    totpUri: string;
    secret: string;
    backupCodes: string[];
  } | null>(null);

  if (!user) return null;
  if (!features.twoFactor?.enabled) {
    return (
      <Card>
        <CardHeader className="mb-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Two-Factor Authentication (2FA)
            </CardTitle>
            <CardDescription>
              Plugin 2FA sedang dinonaktifkan di konfigurasi Auth Core.
            </CardDescription>
          </div>
          <Badge color="warning" variant="soft">
            Plugin Off
          </Badge>
        </CardHeader>
      </Card>
    );
  }

  const handleConfirmPassword = async () => {
    try {
      if (user.twoFactorEnabled) {
        await disableTwoFactor(passwordInput);
        setPasswordPromptOpen(false);
        toast.success("2FA dinonaktifkan.");
      } else {
        const result = await enableTwoFactor(passwordInput);
        setPasswordPromptOpen(false);
        setSetupInfo(result);
        toast.success("2FA diaktifkan! Simpan backup codes Anda.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Aksi 2FA gagal.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="mb-0 flex flex-row items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Two-Factor Authentication (2FA)
              </CardTitle>
              <Badge
                color={user.twoFactorEnabled ? "success" : "secondary"}
                variant="soft"
              >
                {user.twoFactorEnabled ? "Aktif" : "Non-Aktif"}
              </Badge>
            </div>
            <CardDescription>
              Amankan login dengan aplikasi TOTP Authenticator dan backup codes.
            </CardDescription>
          </div>

          <Button
            size="sm"
            color={user.twoFactorEnabled ? "destructive" : "primary"}
            variant={user.twoFactorEnabled ? "outline" : undefined}
            onClick={() => setPasswordPromptOpen(true)}
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            {user.twoFactorEnabled ? "Nonaktifkan 2FA" : "Aktifkan 2FA"}
          </Button>
        </CardHeader>

        {user.twoFactorEnabled && (user.backupCodes?.length ?? 0) > 0 && (
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-default-800">
                Backup Recovery Codes ({user.backupCodes.length} tersisa)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  color="secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      user.backupCodes.join("\n")
                    );
                    toast.success("Backup codes disalin.");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Salin
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  color="primary"
                  onClick={async () => {
                    await regenerateBackupCodes();
                    toast.success("Backup codes baru dibuat.");
                  }}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/50 p-3 sm:grid-cols-4">
              {user.backupCodes.map((code) => (
                <span
                  key={code}
                  className="rounded bg-card px-2 py-1 text-center tabular-nums text-xs text-default-900"
                >
                  {code}
                </span>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <Dialog open={passwordPromptOpen} onOpenChange={setPasswordPromptOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>
              {user.twoFactorEnabled ? "Nonaktifkan 2FA" : "Aktifkan 2FA"}
            </DialogTitle>
            <DialogDescription>
              Konfirmasikan kata sandi Anda untuk melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ba-2fa-pwd">Kata Sandi</Label>
            <Input
              id="ba-2fa-pwd"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              color="secondary"
              onClick={() => setPasswordPromptOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              color={user.twoFactorEnabled ? "destructive" : "primary"}
              onClick={handleConfirmPassword}
            >
              Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(setupInfo)}
        onOpenChange={(open) => !open && setSetupInfo(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Konfigurasi TOTP Authenticator</DialogTitle>
            <DialogDescription>
              Tambahkan secret key atau URI berikut ke aplikasi Authenticator
              Anda.
            </DialogDescription>
          </DialogHeader>
          {setupInfo && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted p-3">
                <div className="text-xs text-muted-foreground">Secret Key</div>
                <div className="mt-1 tabular-nums text-sm font-semibold text-default-900">
                  {setupInfo.secret}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted p-3">
                <div className="text-xs text-muted-foreground">TOTP URI</div>
                <div className="mt-1 break-all tabular-nums text-[11px] text-default-800">
                  {setupInfo.totpUri}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button color="primary" onClick={() => setSetupInfo(null)}>
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PasskeysCard() {
  const { features } = useAuthUI();
  const user = useAuthStore((s) => s.user);
  const addPasskey = useAuthStore((s) => s.addPasskey);
  const removePasskey = useAuthStore((s) => s.removePasskey);

  const [addOpen, setAddOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");

  if (!user) return null;
  if (!features.passkey?.enabled) {
    return (
      <Card>
        <CardHeader className="mb-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Passkeys (WebAuthn)
            </CardTitle>
            <CardDescription>
              Plugin Passkey sedang dinonaktifkan di konfigurasi Auth Core.
            </CardDescription>
          </div>
          <Badge color="warning" variant="soft">
            Plugin Off
          </Badge>
        </CardHeader>
      </Card>
    );
  }

  const passkeys = user.passkeys ?? [];

  return (
    <>
      <Card>
        <CardHeader className="mb-0 flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Passkeys (WebAuthn)
            </CardTitle>
            <CardDescription>
              Masuk tanpa password dengan biometrik perangkat atau hardware key.
            </CardDescription>
          </div>
          <Button size="sm" color="primary" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Tambah Passkey
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {passkeys.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Belum ada passkey terdaftar pada akun ini.
            </p>
          ) : (
            passkeys.map((pk) => (
              <div
                key={pk.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-primary/12 p-2 text-primary">
                    <Fingerprint className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-default-900">
                      {pk.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pk.deviceType} · Ditambahkan {formatDate(pk.createdAt)}
                    </div>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  color="destructive"
                  className="h-8 w-8"
                  onClick={async () => {
                    await removePasskey(pk.id);
                    toast.success("Passkey dihapus.");
                  }}
                  aria-label="Hapus passkey"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Daftarkan Passkey Baru</DialogTitle>
            <DialogDescription>
              Berikan label perangkat untuk memudahkan identifikasi passkey.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ba-pk-name">Nama Perangkat</Label>
            <Input
              id="ba-pk-name"
              placeholder="Mis. YubiKey 5C / Windows Hello"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              color="secondary"
              onClick={() => setAddOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              color="primary"
              onClick={async () => {
                await addPasskey(passkeyName || "Passkey Perangkat");
                setPasskeyName("");
                setAddOpen(false);
                toast.success("Passkey berhasil didaftarkan.");
              }}
            >
              Simpan Passkey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProvidersCard() {
  const { features } = useAuthUI();
  const user = useAuthStore((s) => s.user);
  const linkProvider = useAuthStore((s) => s.linkProvider);
  const unlinkProvider = useAuthStore((s) => s.unlinkProvider);

  if (!user) return null;

  const activeProviders = SOCIAL_PROVIDER_CATALOG.filter(
    (p) => features[p.id]?.enabled
  );
  const linkingEnabled = Boolean(features.accountLinking?.enabled);
  const linked = user.linkedProviders ?? [];

  return (
    <Card>
      <CardHeader className="mb-0">
        <CardTitle className="text-base font-semibold">
          Connected Social Providers
        </CardTitle>
        <CardDescription>
          Hubungkan atau putuskan akun OAuth sosial ke identitas Auth Core Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 pt-4">
        {activeProviders.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Tidak ada Social OAuth provider yang aktif di konfigurasi Auth Core.
          </p>
        ) : (
          activeProviders.map((prov) => {
            const isLinked = linked.includes(prov.provider);
            return (
              <div
                key={prov.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-2.5">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-default-900">
                    {prov.label}
                  </span>
                  <Badge
                    color={isLinked ? "success" : "secondary"}
                    variant="soft"
                    className="text-[10px]"
                  >
                    {isLinked ? "Connected" : "Not linked"}
                  </Badge>
                </div>

                {linkingEnabled && (
                  <Button
                    size="sm"
                    variant={isLinked ? "outline" : "soft"}
                    color={isLinked ? "destructive" : "primary"}
                    onClick={async () => {
                      try {
                        if (isLinked) {
                          await unlinkProvider(prov.provider);
                          toast.info(`${prov.label} diputuskan.`);
                        } else {
                          await linkProvider(prov.provider, prov.id);
                          toast.success(`${prov.label} terhubung.`);
                        }
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : "Gagal update link."
                        );
                      }
                    }}
                  >
                    {isLinked ? (
                      <>
                        <Unlink className="mr-1.5 h-3.5 w-3.5" />
                        Unlink
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export function DeleteAccountCard() {
  const { basePaths, navigate } = useAuthUI();
  const user = useAuthStore((s) => s.user);
  const deleteOwnAccount = useAuthStore((s) => s.deleteOwnAccount);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  if (!user) return null;

  return (
    <>
      <Card className="border-destructive/40">
        <CardHeader className="mb-0">
          <CardTitle className="text-base font-semibold text-destructive">
            Danger Zone — Hapus Akun
          </CardTitle>
          <CardDescription>
            Menghapus akun akan mencabut semua sesi, passkeys, dan API keys yang
            terkait secara permanen.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert color="destructive" variant="soft">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>
              <AlertTitle className="text-sm">Tindakan Permanen</AlertTitle>
              <AlertDescription className="text-xs">
                Aksi ini tidak dapat dibatalkan setelah dikonfirmasi.
              </AlertDescription>
            </div>
          </Alert>
        </CardContent>
        <CardFooter className="justify-end border-t border-border pt-4">
          <Button
            type="button"
            color="destructive"
            variant="outline"
            onClick={() => {
              setConfirmEmail("");
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Hapus Akun Saya
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Akun</AlertDialogTitle>
            <AlertDialogDescription>
              Ketik <span className="tabular-nums font-semibold">{user.email}</span>{" "}
              untuk mengonfirmasi penghapusan akun.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder={user.email}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await deleteOwnAccount(confirmEmail);
                  setConfirmOpen(false);
                  toast.success("Akun Anda telah dihapus.");
                  navigate(basePaths.signIn);
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Konfirmasi penghapusan gagal."
                  );
                }
              }}
            >
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

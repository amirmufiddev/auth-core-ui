import { useEffect } from "react";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { type QueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useThemeStore } from "@/stores/useThemeStore";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { AuthUIProvider } from "@/components/better-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SonnToaster } from "@/components/ui/sonner";

export interface RouterContext {
  queryClient: QueryClient;
}

function RootComponent() {
  const syncFromSystem = useThemeStore((s) => s.syncFromSystem);
  const hydrateFromRemote = useAuthConfigStore((s) => s.hydrateFromRemote);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => syncFromSystem();
    media.addEventListener("change", listener);
    void hydrateFromRemote();
    return () => media.removeEventListener("change", listener);
  }, [syncFromSystem, hydrateFromRemote]);

  return (
    <AuthUIProvider authClient={authClient}>
      <Outlet />
      <SonnToaster />
    </AuthUIProvider>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="mb-0 items-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Halaman Tidak Ditemukan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Route yang Anda akses tidak tersedia di AuthCore Console.
          </p>
          <Button color="primary" asChild>
            <Link to="/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

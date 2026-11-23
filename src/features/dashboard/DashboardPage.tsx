import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  KeyRound,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchDashboardMetrics } from "@/api/auth-service";
import {
  BETTER_AUTH_FEATURES,
  FEATURE_CATEGORY_META,
  type BetterAuthFeatureCategory,
} from "@/config/better-auth.config";
import { formatDate } from "@/lib/utils";
import { useAuthConfigStore } from "@/stores/useAuthConfigStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage() {
  const features = useAuthConfigStore((s) => s.features);
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
  });

  const totalFeatures = BETTER_AUTH_FEATURES.length;
  const activeFeaturesCount = BETTER_AUTH_FEATURES.filter(
    (f) => features[f.id]?.enabled
  ).length;

  const categorySummary = (
    Object.keys(FEATURE_CATEGORY_META) as BetterAuthFeatureCategory[]
  ).map((category) => {
    const items = BETTER_AUTH_FEATURES.filter((f) => f.category === category);
    const activeCount = items.filter((f) => features[f.id]?.enabled).length;
    return {
      category,
      label: FEATURE_CATEGORY_META[category].label,
      total: items.length,
      activeCount,
      percent: Math.round((activeCount / Math.max(1, items.length)) * 100),
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            AuthCore Service Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan identitas, sesi aktif, dan status modul Better Auth yang
            sedang berjalan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" color="secondary" asChild>
            <Link to="/users">
              <Users className="mr-2 h-4 w-4" />
              Kelola Users
            </Link>
          </Button>
          <Button color="primary" asChild>
            <Link to="/auth-features">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Konfigurasi Plugin ({activeFeaturesCount}/{totalFeatures})
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Users Terdaftar
              </span>
              <span className="rounded-md bg-primary/12 p-2 text-primary">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-default-900">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                metrics?.totalUsers ?? 0
              )}
            </div>
            <p className="mt-1 text-xs text-success">
              {metrics?.twoFactorAdoption ?? 0}% mengaktifkan 2FA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Sesi Aktif
              </span>
              <span className="rounded-md bg-info/12 p-2 text-info">
                <Activity className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-default-900">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                metrics?.activeSessions ?? 0
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cookie cache & secondary store
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Better Auth Features Aktif
              </span>
              <span className="rounded-md bg-success/12 p-2 text-success">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-default-900">
              {activeFeaturesCount}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {totalFeatures}
              </span>
            </div>
            <p className="mt-1 text-xs text-success">
              Configurable runtime & env hybrid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Auth Events (24 Jam)
              </span>
              <span className="rounded-md bg-warning/12 p-2 text-warning">
                <KeyRound className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-default-900">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                (metrics?.authEvents24h ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="mt-1 text-xs text-warning">
              {metrics?.bannedUsers ?? 0} akun sedang dibekukan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="mb-0">
            <CardTitle className="text-base font-semibold">
              Tren Autentikasi & Penerbitan Token (14 Hari)
            </CardTitle>
            <CardDescription>
              Perbandingan sesi sign-in dan penerbitan JWT / OAuth access token.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.signInTrend ?? []}>
                  <defs>
                    <linearGradient id="authCorePrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="authCoreInfo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--info)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--info)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokensIssued"
                    name="Token Issued"
                    stroke="var(--info)"
                    fill="url(#authCoreInfo)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="signIns"
                    name="Sign-Ins"
                    stroke="var(--primary)"
                    fill="url(#authCorePrimary)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="mb-0">
            <CardTitle className="text-base font-semibold">
              Distribusi Metode Login
            </CardTitle>
            <CardDescription>
              Adopsi Passkey, OAuth, Magic Link, OTP, dan Email/Password.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.authMethodDistribution ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="method"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Jumlah Login"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader className="mb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Status Modul Better Auth
              </CardTitle>
              <CardDescription>
                Proporsi plugin aktif per kategori arsitektur.
              </CardDescription>
            </div>
            <Button size="sm" color="primary" asChild>
              <Link to="/auth-features">
                Kelola
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {categorySummary.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-default-800">
                    {item.label}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {item.activeCount}/{item.total} aktif
                  </span>
                </div>
                <Progress value={item.percent} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader className="mb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Aktivitas Keamanan Terbaru
              </CardTitle>
              <CardDescription>
                Aliran event autentikasi, RBAC, dan administrasi terbaru.
              </CardDescription>
            </div>
            <Button size="sm" color="secondary" asChild>
              <Link to="/audit-logs">
                Lihat Semua
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border pt-2">
            {(metrics?.recentEvents ?? []).map((evt) => (
              <div
                key={evt.id}
                className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-default-900">
                      {evt.event}
                    </span>
                    <Badge
                      color={
                        evt.severity === "critical"
                          ? "destructive"
                          : evt.severity === "warning"
                            ? "warning"
                            : "info"
                      }
                      variant="soft"
                    >
                      {evt.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Oleh <span className="font-medium">{evt.actorEmail}</span>{" "}
                    pada <span className="font-mono">{evt.target}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(evt.createdAt, "dd MMM · HH:mm")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

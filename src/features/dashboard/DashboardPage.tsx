import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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

const CHART_TOKEN_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

const CATEGORY_PILL_STYLES: string[] = [
  "bg-chart-1/12 text-chart-1 border border-chart-1/20",
  "bg-chart-2/12 text-chart-2 border border-chart-2/20",
  "bg-chart-3/12 text-chart-3 border border-chart-3/20",
  "bg-chart-4/12 text-chart-4 border border-chart-4/20",
  "bg-chart-5/12 text-chart-5 border border-chart-5/20",
  "bg-chart-6/12 text-chart-6 border border-chart-6/20",
];

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
          <Button variant="soft" color="tertiary" asChild>
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
        <Card className="border-t-2 border-t-primary transition-all hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                <Users className="h-4 w-4" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
                <TrendingUp className="h-3 w-3" />
                {metrics?.twoFactorAdoption ?? 0}% 2FA
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                metrics?.totalUsers ?? 0
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-foreground/85">
              Total Users Terdaftar
            </p>
            <p className="text-[11px] text-muted-foreground">
              Akun aktif & terverifikasi
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-tertiary transition-all hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tertiary-soft text-tertiary-soft-foreground">
                <Activity className="h-4 w-4" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-soft px-2 py-0.5 text-[11px] font-medium text-tertiary-soft-foreground">
                <TrendingUp className="h-3 w-3" />
                Live
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                metrics?.activeSessions ?? 0
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-foreground/85">
              Sesi Aktif
            </p>
            <p className="text-[11px] text-muted-foreground">
              Cookie cache & secondary store
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-success transition-all hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-soft text-success">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                {Math.round((activeFeaturesCount / Math.max(1, totalFeatures)) * 100)}%
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {activeFeaturesCount}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {totalFeatures}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-foreground/85">
              Better Auth Features Aktif
            </p>
            <p className="text-[11px] text-muted-foreground">
              Configurable runtime & env hybrid
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-warning transition-all hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft text-warning">
                <KeyRound className="h-4 w-4" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive-soft px-2 py-0.5 text-[11px] font-medium text-destructive">
                {metrics?.bannedUsers ?? 0} dibekukan
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                (metrics?.authEvents24h ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-foreground/85">
              Auth Events (24 Jam)
            </p>
            <p className="text-[11px] text-muted-foreground">
              Login, refresh & audit trail
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="mb-0 flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Tren Autentikasi & Penerbitan Token
              </CardTitle>
              <CardDescription>
                Perbandingan sesi sign-in dan penerbitan JWT / OAuth access token (14 hari).
              </CardDescription>
            </div>
            <Badge variant="soft" color="tertiary">
              14 Hari Terakhir
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics?.signInTrend ?? []}>
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeOpacity={0.7}
                    vertical={false}
                  />
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
                      borderRadius: "10px",
                      color: "var(--popover-foreground)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="signIns"
                    name="Sign-Ins"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "var(--card)", stroke: "var(--chart-1)", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tokensIssued"
                    name="Token Issued"
                    stroke="var(--chart-2)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "var(--card)", stroke: "var(--chart-2)", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="mb-0 flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Distribusi Metode Login
              </CardTitle>
              <CardDescription>
                Adopsi Passkey, OAuth, Magic Link, OTP, dan Email/Password.
              </CardDescription>
            </div>
            <Badge variant="soft" color="secondary">
              Bulan ini
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.authMethodDistribution ?? []}>
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeOpacity={0.7}
                    vertical={false}
                  />
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
                      borderRadius: "10px",
                      color: "var(--popover-foreground)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Jumlah Login"
                    radius={[6, 6, 0, 0]}
                  >
                    {(metrics?.authMethodDistribution ?? []).map((entry, idx) => (
                      <Cell
                        key={entry.method}
                        fill={CHART_TOKEN_VARS[idx % CHART_TOKEN_VARS.length]}
                      />
                    ))}
                  </Bar>
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
            <Button size="sm" variant="soft" color="tertiary" asChild>
              <Link to="/auth-features">
                Kelola
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {categorySummary.map((item, idx) => (
              <div
                key={item.category}
                className="space-y-2 rounded-lg border border-border/70 bg-surface-subtle/75 p-3 transition-colors hover:bg-surface-subtle"
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                      CATEGORY_PILL_STYLES[idx % CATEGORY_PILL_STYLES.length]
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {item.activeCount}/{item.total} aktif
                  </span>
                </div>
                <Progress value={item.percent} className="h-1.5" />
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
            <Button size="sm" variant="soft" color="secondary" asChild>
              <Link to="/audit-logs">
                Lihat Semua
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-5">
            {(metrics?.recentEvents ?? []).map((evt) => {
              const isCritical = evt.severity === "critical";
              const isWarning = evt.severity === "warning";
              return (
                <div
                  key={evt.id}
                  className={
                    isCritical
                      ? "flex flex-col justify-between gap-2 rounded-lg border border-destructive/25 bg-destructive-soft/80 p-3 sm:flex-row sm:items-center"
                      : isWarning
                        ? "flex flex-col justify-between gap-2 rounded-lg border border-warning/25 bg-warning-soft/80 p-3 sm:flex-row sm:items-center"
                        : "flex flex-col justify-between gap-2 rounded-lg border border-border/70 bg-surface-subtle/50 p-3 transition-colors hover:bg-surface-subtle sm:flex-row sm:items-center"
                  }
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        isCritical
                          ? "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive"
                          : isWarning
                            ? "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning"
                            : "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success"
                      }
                    >
                      {isCritical ? (
                        <ShieldAlert className="h-4 w-4" />
                      ) : isWarning ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {evt.event}
                        </span>
                        <Badge
                          color={
                            isCritical
                              ? "destructive"
                              : isWarning
                                ? "warning"
                                : "success"
                          }
                          variant="soft"
                        >
                          {evt.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Oleh <span className="font-medium text-foreground/80">{evt.actorEmail}</span>{" "}
                        pada <span className="font-medium text-foreground/75">{evt.target}</span>
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {formatDate(evt.createdAt, "dd MMM · HH:mm")}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

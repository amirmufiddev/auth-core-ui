import {
  Check,
  LayoutGrid,
  Monitor,
  Moon,
  Palette,
  PanelLeft,
  RotateCcw,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type NavStyle,
  type SidebarType,
  useLayoutStore,
} from "@/stores/useLayoutStore";
import {
  COLOR_THEMES,
  type FooterType,
  type NavbarType,
  type RadiusOption,
  type ThemeMode,
  useThemeStore,
} from "@/stores/useThemeStore";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const COLOR_SCHEME_OPTIONS: Array<{
  id: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    id: "light",
    label: "Light",
    description: "Kanvas terang kontras tinggi",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Nyaman di pencahayaan rendah",
    icon: Moon,
  },
  {
    id: "system",
    label: "System",
    description: "Ikuti preferensi OS otomatis",
    icon: Monitor,
  },
];

const NAV_LAYOUT_OPTIONS: Array<{
  id: NavStyle;
  label: string;
  description: string;
}> = [
  {
    id: "modern",
    label: "Modern",
    description: "Sidebar vertikal modern dengan grup",
  },
  {
    id: "classic",
    label: "Classic",
    description: "Sidebar klasik dengan section header",
  },
  {
    id: "horizontal",
    label: "Horizontal",
    description: "Top navigation bar di bawah header",
  },
];

const RADIUS_OPTIONS: RadiusOption[] = [0, 0.3, 0.5, 0.75, 1];
const SIDEBAR_TYPE_OPTIONS: Array<{
  id: SidebarType;
  label: string;
  description: string;
}> = [
  { id: "module", label: "Module", description: "Sidebar lebar terstruktur" },
  { id: "classic", label: "Classic", description: "Sidebar vertikal standar" },
  { id: "popover", label: "Popover", description: "Mini rail dengan tooltip" },
];
const NAVBAR_TYPE_OPTIONS: NavbarType[] = [
  "sticky",
  "static",
  "floating",
  "hidden",
];
const FOOTER_TYPE_OPTIONS: FooterType[] = ["sticky", "static", "hidden"];

export function ThemePreferencesCard() {
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const colorTheme = useThemeStore((s) => s.colorTheme);
  const radius = useThemeStore((s) => s.radius);
  const navbarType = useThemeStore((s) => s.navbarType);
  const footerType = useThemeStore((s) => s.footerType);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setColorTheme = useThemeStore((s) => s.setColorTheme);
  const setRadius = useThemeStore((s) => s.setRadius);
  const setNavbarType = useThemeStore((s) => s.setNavbarType);
  const setFooterType = useThemeStore((s) => s.setFooterType);
  const resetPreferences = useThemeStore((s) => s.resetPreferences);

  const navStyle = useLayoutStore((s) => s.navStyle);
  const setNavStyle = useLayoutStore((s) => s.setNavStyle);
  const sidebarType = useLayoutStore((s) => s.sidebarType);
  const setSidebarType = useLayoutStore((s) => s.setSidebarType);
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useLayoutStore((s) => s.setSidebarCollapsed);

  const handleReset = () => {
    resetPreferences();
    setNavStyle("modern");
    setSidebarType("classic");
    setSidebarCollapsed(false);
    toast.success("Preferensi tema dikembalikan ke pengaturan default.");
  };

  return (
    <Card>
      <CardHeader className="mb-0 flex flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Theme User Preference
            </CardTitle>
          </div>
          <CardDescription>
            Kustomisasi tampilan Light/Dark, palet warna aksen, layout navigasi,
            radius sudut, dan gaya navbar.
          </CardDescription>
        </div>
        <Badge color="default" variant="soft" className="capitalize">
          {colorTheme} · {resolvedTheme}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* 1. Color Scheme */}
        <div className="space-y-3">
          <div>
            <Badge color="default" variant="soft" className="mb-1.5">
              Color Scheme
            </Badge>
            <p className="text-xs text-muted-foreground">
              Pilih skema warna Light, Dark, atau otomatis mengikuti sistem.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {COLOR_SCHEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = theme === option.id;
              return (
                <Button
                  key={option.id}
                  type="button"
                  variant="outline"
                  color={selected ? "primary" : "secondary"}
                  onClick={() => setTheme(option.id)}
                  className={cn(
                    "relative h-auto flex-col items-start gap-1.5 p-3.5 text-left",
                    selected
                      ? "border-primary bg-primary/8 text-default-900 hover:bg-primary/12 hover:text-default-900"
                      : "border-border text-default-700 hover:bg-accent hover:text-default-900",
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        selected ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {selected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="text-sm font-semibold">{option.label}</div>
                  <div className="text-[11px] font-normal text-muted-foreground">
                    {option.description}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* 2. Theme Color Swatches */}
        <div className="space-y-3">
          <div>
            <Badge color="default" variant="soft" className="mb-1.5">
              Color Palette Harmony
            </Badge>
            <p className="text-xs text-muted-foreground">
              Pilih kombinasi palet warna menyeluruh (Primary, Tertiary, Accent,
              Sidebar, Canvas, dan Chart) berbasis token Tailwind.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {COLOR_THEMES.map((palette) => {
              const isActive = colorTheme === palette.id;
              const swatches = palette.swatches[resolvedTheme];
              return (
                <Button
                  key={palette.id}
                  type="button"
                  variant="outline"
                  color={isActive ? "primary" : "secondary"}
                  onClick={() => setColorTheme(palette.id)}
                  aria-label={`Pilih tema warna ${palette.label}`}
                  className={cn(
                    "h-auto flex-col items-start gap-2.5 p-3 text-left transition-all",
                    isActive
                      ? "border-primary bg-primary-soft/70 text-foreground ring-1 ring-primary/30 hover:bg-primary-soft hover:text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-surface-subtle hover:text-foreground",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center -space-x-1.5">
                      {swatches.map((hex, idx) => (
                        <span
                          key={`${palette.id}-${idx}`}
                          className="h-5 w-5 rounded-full border-2 border-card shadow-xs"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                    {isActive && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-foreground">
                      {palette.label}
                    </div>
                    <div className="mt-0.5 text-[11px] font-normal text-muted-foreground">
                      {palette.subtitle}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* 3. Layout & Sidebar */}
        <div className="space-y-4">
          <div>
            <Badge color="default" variant="soft" className="mb-1.5">
              Navigation Layout
            </Badge>
            <p className="text-xs text-muted-foreground">
              Atur gaya navigasi dashboard dan perilaku sidebar.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {NAV_LAYOUT_OPTIONS.map((layoutOpt) => {
              const selected = navStyle === layoutOpt.id;
              return (
                <Button
                  key={layoutOpt.id}
                  type="button"
                  variant="outline"
                  color={selected ? "primary" : "secondary"}
                  onClick={() => setNavStyle(layoutOpt.id)}
                  className={cn(
                    "h-auto flex-col items-start gap-1.5 p-3.5 text-left",
                    selected
                      ? "border-primary bg-primary/8 text-default-900 hover:bg-primary/12 hover:text-default-900"
                      : "border-border text-default-700 hover:bg-accent hover:text-default-900",
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <LayoutGrid
                      className={cn(
                        "h-4 w-4",
                        selected ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {selected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="text-sm font-semibold">{layoutOpt.label}</div>
                  <div className="text-[11px] font-normal text-muted-foreground">
                    {layoutOpt.description}
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <Badge color="default" variant="soft" className="mb-1.5">
                Sidebar Layout
              </Badge>
              <p className="text-xs text-muted-foreground">
                Pilih mode tampilan sidebar (Module, Classic, atau Popover).
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SIDEBAR_TYPE_OPTIONS.map((sbOpt) => {
                const selected = sidebarType === sbOpt.id;
                const isDisabled =
                  navStyle === "horizontal" &&
                  (sbOpt.id === "module" || sbOpt.id === "classic");
                return (
                  <Button
                    key={sbOpt.id}
                    type="button"
                    variant="outline"
                    disabled={isDisabled}
                    color={selected ? "primary" : "secondary"}
                    onClick={() => setSidebarType(sbOpt.id)}
                    className={cn(
                      "h-auto flex-col items-start gap-1.5 p-3.5 text-left",
                      selected
                        ? "border-primary bg-primary/8 text-default-900 hover:bg-primary/12 hover:text-default-900"
                        : "border-border text-default-700 hover:bg-accent hover:text-default-900",
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <PanelLeft
                        className={cn(
                          "h-4 w-4",
                          selected ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      {selected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="text-sm font-semibold">{sbOpt.label}</div>
                    <div className="text-[11px] font-normal text-muted-foreground">
                      {sbOpt.description}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
            <div className="flex items-center gap-3">
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="pref-sidebar-collapsed"
                  className="cursor-pointer"
                >
                  Perkecil Sidebar (Mini Mode)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Menampilkan ikon saja pada sidebar desktop (mode Modern &
                  Classic).
                </p>
              </div>
            </div>
            <Switch
              id="pref-sidebar-collapsed"
              checked={sidebarCollapsed}
              disabled={navStyle === "horizontal"}
              onCheckedChange={setSidebarCollapsed}
            />
          </div>
        </div>

        <Separator />

        {/* 4. Rounded / Border Radius */}
        <div className="space-y-3">
          <div>
            <Badge color="default" variant="soft" className="mb-1.5">
              Rounded (Border Radius)
            </Badge>
            <p className="text-xs text-muted-foreground">
              Nilai radius sudut komponen dalam satuan <span>rem</span>.
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {RADIUS_OPTIONS.map((value) => {
              const selected = radius === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant={selected ? undefined : "outline"}
                  color={selected ? "primary" : "secondary"}
                  onClick={() => setRadius(value)}
                  className="tabular-nums text-xs"
                >
                  {value === 1 ? "1.0" : String(value)}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* 5. Navbar Type */}
        <div className="space-y-3">
          <div>
            <Badge color="default" variant="soft" className="mb-1.5">
              Navbar Type
            </Badge>
            <p className="text-xs text-muted-foreground">
              Posisi dan gaya bilah header atas dashboard.
            </p>
          </div>
          <RadioGroup
            value={navbarType}
            onValueChange={(val) => setNavbarType(val as NavbarType)}
            className="flex flex-wrap gap-4"
          >
            {NAVBAR_TYPE_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`pref-navbar-${opt}`} />
                <Label
                  htmlFor={`pref-navbar-${opt}`}
                  className="cursor-pointer capitalize"
                >
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* 6. Footer Type */}
        <div className="space-y-3">
          <div>
            <Badge color="default" variant="soft" className="mb-1.5">
              Footer Type
            </Badge>
            <p className="text-xs text-muted-foreground">
              Atur posisi atau sembunyikan bilah footer dashboard.
            </p>
          </div>
          <RadioGroup
            value={footerType}
            onValueChange={(val) => setFooterType(val as FooterType)}
            className="flex flex-wrap gap-4"
          >
            {FOOTER_TYPE_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`pref-footer-${opt}`} />
                <Label
                  htmlFor={`pref-footer-${opt}`}
                  className="cursor-pointer capitalize"
                >
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          Preferensi tersimpan otomatis di browser Anda.
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          color="secondary"
          onClick={handleReset}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset Default
        </Button>
      </CardFooter>
    </Card>
  );
}

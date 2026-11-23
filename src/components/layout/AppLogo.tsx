import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/useThemeStore";

export interface AppLogoProps {
  /** Force dark-surface variant (blue + white shield) regardless of global theme */
  forceDark?: boolean;
  showText?: boolean;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export function AppLogo({
  forceDark = false,
  showText = false,
  subtitle,
  size = "md",
  className,
}: AppLogoProps) {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const useDarkLogo = forceDark || resolvedTheme === "dark";
  const src = useDarkLogo ? "/img/logo/logo-2.png" : "/img/logo/logo.png";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src={src}
        alt="Auth Core Logo"
        className={cn("shrink-0 object-contain", SIZE_MAP[size])}
      />
      {showText && (
        <div className="leading-tight">
          <div
            className={cn(
              "font-display font-semibold tracking-tight text-xl",
              forceDark ? "text-white" : "text-foreground"
            )}
          >
            <span>Auth</span>{" "}
            <span className="text-sky-500">Core</span>
          </div>
          {subtitle && (
            <div
              className={cn(
                "text-[11px]",
                forceDark ? "text-white/70" : "text-muted-foreground"
              )}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

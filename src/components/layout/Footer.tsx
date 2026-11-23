import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/useThemeStore";

export function Footer() {
  const footerType = useThemeStore((s) => s.footerType);

  if (footerType === "hidden") {
    return null;
  }

  return (
    <footer
      className={cn(
        "border-t border-border bg-card/95 px-4 py-3 text-xs text-muted-foreground backdrop-blur sm:px-6",
        footerType === "sticky" && "sticky bottom-0 z-20"
      )}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 sm:flex-row">
        <span>
          COPYRIGHT &copy; {new Date().getFullYear()} {siteConfig.name}. All
          rights reserved.
        </span>
        <span>
          Better Auth Service Console · v{siteConfig.version}
        </span>
      </div>
    </footer>
  );
}

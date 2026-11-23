import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2 } from "lucide-react";

export interface OrganizationLogoProps {
  name?: string | null;
  slug?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<
  NonNullable<OrganizationLogoProps["size"]>,
  string
> = {
  sm: "h-6 w-6 rounded-md text-[10px]",
  md: "h-8 w-8 rounded-md text-xs",
  lg: "h-11 w-11 rounded-lg text-sm",
};

export function OrganizationLogo({
  name,
  slug,
  size = "md",
  className,
}: OrganizationLogoProps) {
  const source = name || slug || "OR";
  const initials = source
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 1)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)}>
      <AvatarFallback>
        <Building2 className="h-4 w-4 shrink-0" />
        <span className="hidden">{initials}</span>
      </AvatarFallback>
    </Avatar>
  );
}

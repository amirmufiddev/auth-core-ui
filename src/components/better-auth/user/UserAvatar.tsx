import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserAvatarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const label = user?.name || user?.email || "AU";
  const initials = label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)}>
      {user?.avatarUrl ? (
        <AvatarImage src={user.avatarUrl} alt={user.name ?? "User avatar"} />
      ) : null}
      <AvatarFallback className="bg-primary/15 font-semibold text-primary">
        {initials || "AU"}
      </AvatarFallback>
    </Avatar>
  );
}

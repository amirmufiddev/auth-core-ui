import * as React from "react";
import { cn } from "@/lib/utils";

export interface CleaveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  options?: Record<string, unknown>;
}

const CleaveInput = React.forwardRef<HTMLInputElement, CleaveInputProps>(
  ({ className, type = "text", options: _options, ...props }, ref) => {
    return (
      <div className="w-full flex-1">
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded border border-default-300 bg-background px-3 py-2 text-sm transition duration-300 placeholder:text-accent-foreground/50 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-secondary disabled:opacity-50 read-only:bg-secondary",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  }
);
CleaveInput.displayName = "CleaveInput";

export { CleaveInput };

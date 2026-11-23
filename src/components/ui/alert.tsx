import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg  p-4  flex md:items-center items-start space-x-4 rtl:space-x-reverse ",
  {
    variants: {
      color: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary  text-secondary-foreground",
        success: "bg-success text-success-foreground",
        info: "bg-info text-info-foreground",
        warning: "bg-warning text-warning-foreground",
        destructive: "bg-destructive text-destructive-foreground ",
        dark: "bg-gray-950 text-slate-50 ",
      },
      variant: {
        outline: "border border-current bg-background ",
        soft: "text-current border-current bg-primary/10",
      },
    },
    compoundVariants: [
      ...(["destructive", "success", "info", "warning", "dark"] as const).map((color) => ({
        variant: "outline" as const,
        color,
        className: `text-${color} bg-transparent`,
      })),
      {
        variant: "outline",
        color: "secondary",
        className: " text-default-700 dark:text-default-400  bg-transparent ",
      },

      {
        variant: "outline",
        color: "default",
        className: "text-primary bg-transparent",
      },
      {
        variant: "soft",
        color: "info",
        className: "text-info bg-info/12 dark:bg-info/16",
      },
      {
        variant: "soft",
        color: "warning",
        className: "text-warning bg-warning/12 dark:bg-warning/16",
      },
      {
        variant: "soft",
        color: "destructive",
        className: "text-destructive bg-destructive/12 dark:bg-destructive/16",
      },
      {
        variant: "soft",
        color: "success",
        className: "text-success bg-success/12 dark:bg-success/16",
      },
      {
        variant: "soft",
        color: "default",
        className: "text-primary bg-primary/12 dark:bg-primary/16",
      },
      {
        variant: "soft",
        color: "secondary",
        className: "text-card-foreground bg-secondary/40",
      },
    ],
    defaultVariants: {
      color: "default",
    },
  }
);

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, color, variant, dismissible, onDismiss, children, ...props },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);

    const handleDismiss = () => {
      setDismissed(true);
      if (onDismiss) {
        onDismiss();
      }
    };

    return !dismissed ? (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ color, variant }), className)}
        {...props}
      >
        {children}
        {dismissible && (
          <button type="button" onClick={handleDismiss} className="grow-0 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    ) : null;
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-2 font-medium leading-none tracking-tight grow text-lg",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed grow", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

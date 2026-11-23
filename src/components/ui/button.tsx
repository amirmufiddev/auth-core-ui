import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0   disabled:opacity-50  whitespace-nowrap disabled:pointer-events-none",
  {
    variants: {
      color: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        tertiary:
          "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 shadow-xs",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
        info: "bg-info text-info-foreground hover:bg-info/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        dark: "bg-foreground text-background hover:bg-foreground/90",
      },
      variant: {
        outline:
          "border border-current bg-transparent hover:text-primary-foreground",
        soft: "bg-primary/10 hover:text-primary-foreground",
        ghost: "bg-transparent text-current hover:text-primary-foreground",
      },
      size: {
        default: "h-10 px-4 py-[10px]",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-[18px] py-[10px] text-base",
        xl: "h-12 rounded-md px-6 py-3 text-base",
        md: "h-9 rounded-md px-4 py-2",
        xs: "h-9 rounded-md px-[14px] py-[6px]",
        icon: "h-10 w-10",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "destructive",
        className:
          "text-destructive hover:text-destructive-foreground hover:border-destructive hover:bg-destructive",
      },
      {
        variant: "outline",
        color: "success",
        className:
          "text-success hover:text-success-foreground hover:border-success hover:bg-success",
      },
      {
        variant: "outline",
        color: "info",
        className:
          "text-info hover:text-info-foreground hover:border-info hover:bg-info",
      },
      {
        variant: "outline",
        color: "warning",
        className:
          "text-warning hover:text-warning-foreground hover:border-warning hover:bg-warning",
      },
      {
        variant: "outline",
        color: "dark",
        className: "text-accent-foreground hover:bg-accent-foreground",
      },
      {
        variant: "outline",
        color: "secondary",
        className:
          "text-foreground bg-card hover:bg-accent hover:text-accent-foreground border-border",
      },
      {
        variant: "outline",
        color: "tertiary",
        className:
          "text-tertiary border-tertiary/40 hover:bg-tertiary hover:text-tertiary-foreground hover:border-tertiary",
      },
      {
        variant: "outline",
        color: "default",
        className:
          "text-primary border-primary/40 hover:text-primary-foreground hover:border-primary hover:bg-primary",
      },
      {
        variant: "outline",
        color: "primary",
        className:
          "text-primary border-primary/40 hover:text-primary-foreground hover:border-primary hover:bg-primary",
      },
      {
        variant: "soft",
        color: "tertiary",
        className:
          "text-tertiary-soft-foreground bg-tertiary-soft hover:bg-tertiary hover:text-tertiary-foreground",
      },
      {
        variant: "soft",
        color: "info",
        className:
          "text-info bg-info/12 dark:bg-info/16 hover:bg-info hover:text-info-foreground",
      },
      {
        variant: "soft",
        color: "warning",
        className:
          "text-warning bg-warning/12 dark:bg-warning/16 hover:bg-warning hover:text-warning-foreground",
      },
      {
        variant: "soft",
        color: "destructive",
        className:
          "text-destructive bg-destructive/12 dark:bg-destructive/16 hover:bg-destructive hover:text-destructive-foreground",
      },
      {
        variant: "soft",
        color: "success",
        className:
          "text-success bg-success/12 dark:bg-success/16 hover:bg-success hover:text-success-foreground",
      },
      {
        variant: "soft",
        color: "secondary",
        className:
          "text-secondary-foreground bg-secondary hover:bg-accent hover:text-accent-foreground",
      },
      {
        variant: "soft",
        color: "default",
        className:
          "text-primary-soft-foreground bg-primary-soft hover:bg-primary hover:text-primary-foreground",
      },
      {
        variant: "ghost",
        color: "default",
        className:
          "text-primary hover:bg-primary-soft hover:text-primary-soft-foreground",
      },
      {
        variant: "ghost",
        color: "tertiary",
        className:
          "text-tertiary hover:bg-tertiary-soft hover:text-tertiary-soft-foreground",
      },
      {
        variant: "ghost",
        color: "secondary",
        className:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      },
      {
        variant: "ghost",
        color: "success",
        className: " text-success  hover:text-success-foreground ",
      },
      {
        variant: "ghost",
        color: "info",
        className: " text-info hover:text-info-foreground ",
      },
      {
        variant: "ghost",
        color: "warning",
        className: " text-warning hover:text-warning-foreground ",
      },
      {
        variant: "ghost",
        color: "destructive",
        className: " text-destructive  hover:text-destructive-foreground ",
      },
    ],

    defaultVariants: {
      color: "default",
      size: "default",
    },
  },
);

export type ButtonColor = VariantProps<typeof buttonVariants>["color"];
export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    Omit<VariantProps<typeof buttonVariants>, "color" | "variant" | "size"> {
  asChild?: boolean;
  sx?: Record<string, string | number>;
  color?: ButtonColor | (string & {});
  variant?: ButtonVariant | (string & {});
  size?: ButtonSize | (string & {});
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, color, asChild = false, sx, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({
            variant: variant as ButtonVariant,
            size: size as ButtonSize,
            color: color as ButtonColor,
            className,
          }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

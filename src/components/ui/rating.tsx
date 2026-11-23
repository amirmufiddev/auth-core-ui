import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ratingVariants = cva("inline-flex items-center gap-1", {
  variants: {
    variant: {
      flat: "flat",
      outline: "outline-style",
    },
  },
  defaultVariants: {
    variant: "flat",
  },
});

export interface RatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof ratingVariants> {
  value?: number;
  items?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      variant,
      value = 0,
      items = 5,
      readOnly = false,
      onChange,
      ...props
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const activeCount = hoverValue ?? value;

    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(ratingVariants({ variant }), className)}
        {...props}
      >
        {Array.from({ length: items }, (_, idx) => {
          const starValue = idx + 1;
          const filled = starValue <= activeCount;
          return (
            <button
              key={starValue}
              type="button"
              disabled={readOnly}
              aria-label={`Rate ${starValue} of ${items}`}
              onMouseEnter={() => !readOnly && setHoverValue(starValue)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              onClick={() => !readOnly && onChange?.(starValue)}
              className={cn(
                "transition-transform focus-visible:outline-none",
                !readOnly && "cursor-pointer hover:scale-110",
                readOnly && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  filled
                    ? "fill-warning text-warning"
                    : "fill-transparent text-default-300"
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }
);
Rating.displayName = "Rating";

export { Rating };

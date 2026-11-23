import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "relative flex h-7 items-center justify-center pt-1",
        caption_label: "text-sm font-medium text-foreground",
        nav: "flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 top-1 z-10 h-7 w-7 border-border bg-transparent p-0 text-foreground opacity-70 hover:bg-accent hover:text-accent-foreground hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 top-1 z-10 h-7 w-7 border-border bg-transparent p-0 text-foreground opacity-70 hover:bg-accent hover:text-accent-foreground hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-center text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button:
          "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md p-0 font-normal transition-colors hover:bg-accent hover:text-accent-foreground",
        selected:
          props.mode === "range"
            ? ""
            : "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        range_start:
          "rounded-l-md bg-accent [&>button]:rounded-md [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        range_end:
          "rounded-r-md bg-accent [&>button]:rounded-md [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        range_middle:
          "rounded-none bg-accent text-accent-foreground [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button]:hover:bg-accent",
        today:
          "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-semibold",
        outside:
          "!bg-transparent text-muted-foreground opacity-40 [&>button]:!bg-transparent [&>button]:!text-muted-foreground",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName }) => {
          const Icon =
            orientation === "right" || orientation === "down"
              ? ChevronRight
              : ChevronLeft;
          return <Icon className={cn("h-4 w-4", iconClassName)} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

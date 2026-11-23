import * as React from "react";

import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

export interface TimePickerProps
  extends Omit<InputProps, "type" | "value" | "onChange"> {
  value?: string;
  onChange: (time: string) => void;
}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, value, onChange, step = "60", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="time"
        step={step}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
          className
        )}
        {...props}
      />
    );
  }
);
TimePicker.displayName = "TimePicker";

export { TimePicker };

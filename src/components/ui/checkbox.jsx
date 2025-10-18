import React from "react";
import { cn } from "../../lib/cn";

export function CheckboxGroup({
  children,
  label,
  orientation = "vertical",
  className,
}) {
  return (
    <div
      data-testid='checkbox-group'
      data-label={label}
      data-orientation={orientation}
      className={cn("grid gap-2", className)}
    >
      {label && (
        <span className='text-sm font-medium text-foreground'>{label}</span>
      )}
      <div
        className={cn(
          orientation === "horizontal" ? "flex flex-wrap gap-2" : "grid gap-2"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Checkbox({ children, value, className, ...props }) {
  return (
    <label
      data-testid='checkbox'
      data-value={value}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <input
        type='checkbox'
        value={value}
        className='h-4 w-4 rounded-md border-input ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:bg-accent/20 transition-colors'
        {...props}
      />
      <span>{children}</span>
    </label>
  );
}

import React from "react";
import { cn } from "../../lib/cn";

export default function Textarea({
  label,
  className,
  value,
  onChange,
  minRows = 3,
  ...props
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      {label && (
        <label className='text-sm font-medium text-foreground'>{label}</label>
      )}
      <textarea
        data-testid='textarea'
        className={cn(
          "flex w-full rounded-lg ring-1 ring-border border-0 bg-background/60 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "hover:bg-accent/5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        )}
        rows={minRows}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}

import React from "react";
import { cn } from "../../lib/cn";

export default function Textarea({ label, className, value, onChange, minRows = 3, ...props }) {
  return (
    <div className={cn("grid gap-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        data-testid="textarea"
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        )}
        rows={minRows}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}
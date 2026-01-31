import React from "react";
import { cn } from "../../lib/cn";

export function Select({
  label,
  placeholder,
  selectedKeys = [],
  onSelectionChange,
  className,
  children,
}) {
  const value = selectedKeys?.[0] ?? "";
  const handleChange = (e) => {
    const next = e.target.value;
    onSelectionChange && onSelectionChange(new Set([next]));
  };

  return (
    <div data-testid='select-wrapper' className={cn("grid gap-2", className)}>
      {label && (
        <label
          data-testid='select-label'
          className='text-sm font-medium text-foreground'
        >
          {label}
        </label>
      )}
      <select
        data-testid='select'
        value={value}
        onChange={handleChange}
        className={cn(
          "flex h-10 w-full rounded-lg ring-1 ring-border border-0 glass-input px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:scale-[1.01]",
          "hover:bg-[hsla(var(--glass-bg-hover))] hover:shadow-glass transition-all duration-fast ease-out disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {placeholder && (
          <option key='placeholder' value='' disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    </div>
  );
}

export function SelectItem({ children, value }) {
  return (
    <option data-testid='select-item' value={value}>
      {children}
    </option>
  );
}

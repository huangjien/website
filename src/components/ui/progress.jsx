import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/cn";
import React from "react";

export default function Progress({
  value,
  isIndeterminate = false,
  size = "md",
  className,
  ...props
}) {
  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <ProgressPrimitive.Root
      data-testid='progress'
      className={cn(
        "relative overflow-hidden rounded-full bg-muted ring-1 ring-border shadow-xs",
        sizes[size],
        className
      )}
      value={isIndeterminate ? undefined : value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-transform",
          isIndeterminate
            ? "animate-[progress-indeterminate_1.5s_infinite]"
            : ""
        )}
        style={{
          transform: isIndeterminate
            ? "translateX(-50%)"
            : `translateX(-${100 - (value || 0)}%)`,
        }}
      />
      <style jsx>{`
        @keyframes progress-indeterminate {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </ProgressPrimitive.Root>
  );
}

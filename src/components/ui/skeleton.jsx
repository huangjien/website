import React from "react";
import { cn } from "../../lib/cn";

/**
 * Skeleton - A skeleton loading component for content placeholders
 *
 * @param {string} className - Additional CSS classes
 * @param {string} variant - Shape variant: "rectangle", "circle", "text"
 * @param {string} width - Custom width (e.g., "w-full", "w-32")
 * @param {string} height - Custom height (e.g., "h-4", "h-32")
 * @param {number} lines - Number of text lines (for text variant)
 */
export default function Skeleton({
  className = "",
  variant = "rectangle",
  width = "",
  height = "",
  lines = 3,
  ...props
}) {
  const baseClasses =
    "animate-shimmer bg-muted/50 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

  if (variant === "circle") {
    return (
      <div
        className={cn(
          "rounded-full",
          width || "w-12",
          height || "h-12",
          baseClasses,
          className,
        )}
        {...props}
        aria-hidden='true'
      />
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)} {...props} aria-hidden='true'>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 rounded-md",
              baseClasses,
              i === lines - 1 ? "w-3/4" : "w-full",
            )}
          />
        ))}
      </div>
    );
  }

  // Default rectangle variant
  return (
    <div
      className={cn(
        "rounded-md",
        width || "w-full",
        height || "h-20",
        baseClasses,
        className,
      )}
      {...props}
      aria-hidden='true'
    />
  );
}

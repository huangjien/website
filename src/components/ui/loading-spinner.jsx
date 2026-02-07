import React from "react";
import { cn } from "../../lib/cn";
import { useTranslation } from "react-i18next";

/**
 * LoadingSpinner - A reusable spinner component for loading states
 *
 * @param {string} size - Size variant: "sm", "md", "lg"
 * @param {string} variant - Color variant: "primary", "secondary", "current"
 * @param {string} className - Additional CSS classes
 * @param {string} animationType - Animation type: "spin", "pulse", "dots"
 */
export default function LoadingSpinner({
  size = "md",
  variant = "primary",
  className = "",
  animationType = "spin",
  ...props
}) {
  const { t } = useTranslation();

  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-3",
    lg: "h-8 w-8 border-4",
  };

  const variants = {
    primary: "border-primary border-t-transparent",
    secondary: "border-secondary border-t-transparent",
    current: "border-foreground border-t-transparent",
  };

  if (animationType === "dots") {
    return (
      <div
        className={cn("flex items-center justify-center gap-1", className)}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("rounded-full bg-current animate-bounce-subtle", {
              "h-1 w-1": size === "sm",
              "h-2 w-2": size === "md",
              "h-3 w-3": size === "lg",
            })}
            style={{
              animationDelay: `${i * 150}ms`,
            }}
            aria-hidden='true'
          />
        ))}
      </div>
    );
  }

  if (animationType === "pulse") {
    return (
      <div
        className={cn(
          "rounded-full bg-current animate-pulse-slow",
          {
            "h-4 w-4": size === "sm",
            "h-6 w-6": size === "md",
            "h-8 w-8": size === "lg",
          },
          {
            "bg-primary": variant === "primary",
            "bg-secondary": variant === "secondary",
            "bg-foreground": variant === "current",
          },
          className
        )}
        {...props}
        aria-label={t("loading_spinner.loading", { defaultValue: "Loading" })}
      />
    );
  }

  // Default spin animation
  return (
    <div
      className={cn(
        "rounded-full border-solid animate-spin-slow",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
      aria-label={t("loading_spinner.loading", { defaultValue: "Loading" })}
    />
  );
}

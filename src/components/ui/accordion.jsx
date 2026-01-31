import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "../../lib/cn";

// Root wrapper with sensible defaults, overridable via props
export function Root({
  className,
  type = "single",
  collapsible = true,
  ...props
}) {
  return (
    <AccordionPrimitive.Root
      type={type}
      collapsible={collapsible}
      className={cn("m-2 w-fit", className)}
      {...props}
    />
  );
}

// Item wrapper to provide consistent spacing/border defaults
export function Item({ className, ...props }) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "rounded-2xl p-4 my-2 glass-card hover:shadow-glass-hover transition-all duration-fast ease-out",
        className
      )}
      {...props}
    />
  );
}

// Header wrapper for structural consistency
export function Header({ className, ...props }) {
  return (
    <AccordionPrimitive.Header className={cn("w-full", className)} {...props} />
  );
}

// Trigger wrapper with accessible, focus-visible styles
export const Trigger = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between gap-2 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 hover:bg-[hsla(var(--glass-bg-hover))] rounded-xl transition-all duration-fast ease-out cursor-pointer",
        className
      )}
      {...props}
    />
  );
});
Trigger.displayName = "AccordionTrigger";

// Content wrapper with tailwindcss-animate hooks
export const Content = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden pt-2 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up transition-all duration-slow ease-out",
        className
      )}
      {...props}
    />
  );
});
Content.displayName = "AccordionContent";

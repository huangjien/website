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
        "rounded-xl p-3 my-2 shadow-xs hover:shadow-md transition-shadow",
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
        "flex w-full items-center justify-between gap-2 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:bg-accent/30 rounded-lg",
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

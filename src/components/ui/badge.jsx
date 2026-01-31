import React from "react";
import { tv } from "tailwind-variants";
import { cn } from "../../lib/cn";

const badgeVariants = tv({
  base: "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-fast ease-out focus:outline-none focus:ring-2 focus:ring-primary/50 hover:scale-110 hover:shadow-glass active:scale-95 cursor-pointer",
  variants: {
    variant: {
      default:
        "glass bg-secondary/80 text-secondary-foreground hover:bg-[hsla(var(--glass-bg-hover))]",
      outline:
        "glass border border-border/50 text-foreground hover:bg-[hsla(var(--glass-bg-hover))]",
      success:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-glass",
      warning:
        "glass bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-glass",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export default function Badge({ variant, className, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

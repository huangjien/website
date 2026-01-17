import React from "react";
import { tv } from "tailwind-variants";
import { cn } from "../../lib/cn";

const badgeVariants = tv({
  base: "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-fast ease-out focus:outline-none focus:ring-2 focus:ring-primary/50 hover:scale-110 hover:shadow-glass active:scale-95 cursor-pointer",
  variants: {
    variant: {
      default:
        "glass bg-secondary/80 text-secondary-foreground hover:bg-secondary/90",
      outline: "glass border border-border/50 text-foreground hover:bg-white/10",
      success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm",
      warning:
        "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 shadow-sm",
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

import React from "react";
import { tv } from "tailwind-variants";
import { cn } from "../../lib/cn";

const badgeVariants = tv({
  base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-fast ease-out focus:outline-none focus:ring-2 focus:ring-ring hover:scale-110 hover:shadow-sm active:scale-95",
  variants: {
    variant: {
      default:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "bg-transparent text-foreground",
      success: "border-transparent bg-green-600 text-white hover:bg-green-700",
      warning:
        "border-transparent bg-yellow-500 text-black hover:bg-yellow-600",
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

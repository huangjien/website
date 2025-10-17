import React from "react";
import { tv } from "tailwind-variants";
import { cn } from "../../lib/cn";

const badgeVariants = tv({
  base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
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

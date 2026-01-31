import React from "react";
import { tv } from "tailwind-variants";
import { cn } from "../../lib/cn";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-fast ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  variants: {
    variant: {
      default:
        "glass-button text-primary-foreground hover:scale-105 active:scale-95",
      outline:
        "glass hover:bg-[hsla(var(--glass-bg-hover))] hover:text-accent-foreground hover:shadow-glass hover:scale-105 active:scale-95",
      ghost:
        "hover:bg-[hsla(var(--glass-bg-hover))] hover:text-accent-foreground hover:scale-105 active:scale-95",
      secondary:
        "glass hover:bg-[hsla(var(--glass-bg-hover))] text-secondary-foreground hover:shadow-glass hover:scale-105 active:scale-95",
      destructive:
        "bg-gradient-to-r from-red-500 to-red-600 text-destructive-foreground hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105 active:scale-95",
      gradient:
        "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 hover:shadow-glow hover:scale-105 active:scale-95",
    },
    size: {
      sm: "h-9 px-3",
      md: "h-11 px-5 py-2.5",
      lg: "h-13 px-7",
      icon: "h-11 w-11",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export default function Button({ variant, size, className, ...props }) {
  return (
    <button
      data-testid='button'
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

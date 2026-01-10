import React from "react";
import { tv } from "tailwind-variants";
import { cn } from "../../lib/cn";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:scale-105 active:scale-95",
      outline:
        "bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:scale-105 active:scale-95",
      ghost:
        "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm hover:scale-105 active:scale-95",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md hover:scale-105 active:scale-95",
      gradient:
        "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 hover:shadow-md hover:scale-105 active:scale-95",
    },
    size: {
      sm: "h-8 px-2",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6",
      icon: "h-10 w-10",
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

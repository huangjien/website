import React from "react";
import { tv } from "tailwind-variants";
import { cn } from "../../lib/cn";
import LoadingSpinner from "./loading-spinner";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-xl text-sm font-medium tracking-tight transition-all duration-normal ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/35 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground shadow-[0_1px_0_hsl(var(--primary-foreground)/0.15)_inset,0_8px_20px_-10px_hsl(var(--primary)/0.5)] hover:brightness-110 hover:-translate-y-px active:translate-y-0 active:brightness-95",
      outline:
        "glass hover:bg-[hsla(var(--glass-bg-hover))] hover:text-accent-foreground hover:shadow-glass hover:-translate-y-px active:translate-y-0",
      ghost:
        "hover:bg-[hsla(var(--glass-bg-hover))] hover:text-accent-foreground active:scale-[0.98]",
      secondary:
        "glass hover:bg-[hsla(var(--glass-bg-hover))] text-secondary-foreground hover:shadow-glass hover:-translate-y-px active:translate-y-0",
      destructive:
        "bg-destructive text-destructive-foreground hover:brightness-110 hover:-translate-y-px active:translate-y-0 shadow-[0_8px_20px_-10px_hsl(var(--destructive)/0.55)]",
      gradient:
        "bg-primary text-primary-foreground hover:brightness-110 hover:-translate-y-px active:translate-y-0 shadow-[0_1px_0_hsl(var(--primary-foreground)/0.15)_inset,0_8px_20px_-10px_hsl(var(--primary)/0.5)]",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      sm: "h-9 px-3.5",
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

export default function Button({
  variant,
  size,
  className,
  loading = false,
  children,
  disabled,
  ...props
}) {
  return (
    <button
      data-testid='button'
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size='sm'
          variant='current'
          className='mr-2'
          aria-hidden='true'
        />
      )}
      {children}
    </button>
  );
}

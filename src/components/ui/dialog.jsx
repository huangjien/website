import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/cn";
import React from "react";

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogTrigger({ children, asChild = true }) {
  return (
    <DialogPrimitive.Trigger asChild={asChild}>
      {children}
    </DialogPrimitive.Trigger>
  );
}

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/50' />
      <DialogPrimitive.Content
        data-testid='modal'
        className={cn(
          "fixed inset-0 z-50 m-4 flex items-center justify-center",
          className
        )}
        {...props}
      >
        <div
          data-testid='modal-content'
          className='max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg border bg-background p-4 shadow-lg'
        >
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogBody({ className, children, ...props }) {
  return (
    <div data-testid='modal-body' className={cn("p-3", className)} {...props}>
      {children}
    </div>
  );
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div
      data-testid='modal-footer'
      className={cn(
        "flex items-center justify-end gap-2 border-t p-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/cn";
import React, { useEffect, useRef } from "react";

export function Dialog({ open, onOpenChange, children }) {
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement;
    }
  }, [open]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen && previousActiveElement.current) {
      setTimeout(() => {
        previousActiveElement.current?.focus();
      }, 0);
    }
    onOpenChange?.(isOpen);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <span data-testid='modal' className='z-50' hidden />
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
      <DialogPrimitive.Overlay
        className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 transition-opacity duration-fast ease-out'
        aria-hidden='true'
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-0 z-50 m-4 flex items-center justify-center",
        )}
        aria-modal='true'
        role='dialog'
        {...props}
      >
        <div
          data-testid='modal-content'
          className={cn(
            "max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl glass-modal p-5 animate-scale-in data-[state=closed]:animate-scale-out transition-all duration-normal ease-out",
            className,
          )}
        >
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogBody({ className, children, ...props }) {
  return (
    <div data-testid='dialog-body' className={cn("p-3", className)} {...props}>
      {children}
    </div>
  );
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div
      data-testid='dialog-footer'
      className={cn(
        "flex items-center justify-end gap-2 border-t p-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

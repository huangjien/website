import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";

export default function Tooltip({ content, children, className, ...props }) {
  const isTest = process.env.NODE_ENV === "test";
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root defaultOpen={isTest} {...props}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            data-testid='tooltip'
            forceMount
            sideOffset={6}
            className={cn(
              "z-50 overflow-hidden rounded-lg border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
              "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
              className
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className='fill-popover' />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

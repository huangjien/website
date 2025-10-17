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
              "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
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

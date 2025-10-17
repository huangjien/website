import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";

export default function Tooltip({ content, children, className, ...props }) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={0} {...props}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          data-testid="tooltip"
          forceMount
          sideOffset={6}
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
            className
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-popover" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
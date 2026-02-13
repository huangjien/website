import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../lib/cn";

export const Avatar = ({ className, ...props }) => {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "inline-flex h-8 w-8 rounded-full overflow-hidden",
        className,
      )}
      {...props}
    />
  );
};

export const AvatarImage = ({ className, ...props }) => {
  return (
    <AvatarPrimitive.Image
      className={cn("object-cover h-full w-full", className)}
      {...props}
    />
  );
};

export const AvatarFallback = ({ className, children, ...props }) => {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  );
};

// Default export maintains backward compatibility: renders Image + Fallback when src/alt provided
export default function AvatarDefault({
  src,
  alt,
  className,
  fallback,
  children,
  ...props
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "inline-flex h-8 w-8 rounded-full overflow-hidden",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          {src ? (
            <AvatarPrimitive.Image
              src={src}
              alt={alt}
              className='object-cover h-full w-full'
            />
          ) : null}
          <AvatarPrimitive.Fallback className='flex h-full w-full items-center justify-center bg-muted text-muted-foreground'>
            {fallback || (alt ? alt[0]?.toUpperCase() : "?")}
          </AvatarPrimitive.Fallback>
        </>
      )}
    </AvatarPrimitive.Root>
  );
}

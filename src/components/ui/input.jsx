import { cn } from "../../lib/cn";

export default function Input({
  label,
  className,
  type = "text",
  value,
  onChange,
  isClearable = false,
  onClear,
  startContent,
  ...props
}) {
  const handleClear = (e) => {
    if (onClear) onClear(e);
  };

  return (
    <div data-testid='input-wrapper' className={cn("grid gap-2", className)}>
      {label && (
        <label
          data-testid='input-label'
          className='text-sm font-medium text-foreground'
        >
          {label}
        </label>
      )}
      <div className='relative flex items-center'>
        {startContent && (
          <span
            aria-hidden='true'
            className='absolute left-2 text-muted-foreground'
          >
            {startContent}
          </span>
        )}
        <input
          data-testid='input'
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg ring-1 ring-border border-0 bg-background/60 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "hover:bg-accent/5 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            startContent ? "pl-8" : ""
          )}
          value={value}
          onChange={onChange}
          {...props}
        />
        {isClearable && value && value.length > 0 && (
          <button
            type='button'
            aria-label='clear'
            className='absolute right-2 inline-flex items-center rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent'
            onClick={handleClear}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

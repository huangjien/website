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
            "flex h-11 w-full rounded-xl ring-1 ring-border/50 border-0 glass-input px-4 py-2.5 text-sm",
            "placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:scale-[1.01] focus-visible:shadow-glow",
            "hover:bg-[hsla(var(--glass-bg-hover))] hover:shadow-glass transition-all duration-fast ease-out disabled:cursor-not-allowed disabled:opacity-50",
            startContent ? "pl-10" : ""
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

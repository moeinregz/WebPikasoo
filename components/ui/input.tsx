import * as React from "react";
import { cn } from "@/lib/utils";

// shadcn Input, mapped to the site's theme tokens.
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-ink/15 bg-canvas/60 px-3 py-2 text-sm text-ink ring-offset-canvas transition-colors placeholder:text-dim/70 focus-visible:border-blood-hi/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blood-hi/40 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// shadcn/ui Badge, with shadcn's color tokens mapped to this site's theme
// (ink / canvas / surface) so it stays black and white.
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ink/40 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-canvas hover:bg-ink/80",
        secondary: "border-transparent bg-surface text-ink hover:bg-surface/80",
        destructive: "border-transparent bg-red-600 text-white hover:bg-red-600/80",
        outline: "text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

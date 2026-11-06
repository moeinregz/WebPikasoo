import React from "react";
import { cn } from "@/lib/utils";

// Pricing card primitives (21st.dev "pricing-card"), with shadcn's color
// tokens mapped to this site's theme: card/muted -> surface & ink tints,
// muted-foreground -> dim, foreground -> ink, border -> ink/10. The card
// isn't capped at max-w-xs so it fills its grid column.

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("relative w-full rounded-xl border border-ink/10 bg-surface/70 p-1.5 shadow-xl backdrop-blur-xl", className)}
      {...props}
    />
  );
}

function Header({ className, children, glassEffect = true, ...props }: React.ComponentProps<"div"> & { glassEffect?: boolean }) {
  return (
    <div className={cn("relative mb-4 rounded-xl border border-ink/10 bg-ink/[0.05] p-4", className)} {...props}>
      {glassEffect && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-[inherit]"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)" }}
        />
      )}
      {children}
    </div>
  );
}

function Plan({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative mb-8 flex items-center justify-between", className)} {...props} />;
}

function Description({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-xs text-dim", className)} {...props} />;
}

function PlanName({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2 text-sm font-medium text-dim [&_svg:not([class*='size-'])]:size-4", className)} {...props} />;
}

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("rounded-full border border-ink/20 px-2 py-0.5 text-xs text-ink/80", className)} {...props} />;
}

function Price({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative mb-3 flex items-end gap-1", className)} {...props} />;
}

function MainPrice({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("text-3xl font-extrabold tracking-tight", className)} {...props} />;
}

function Period({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("pb-1 text-sm text-ink/80", className)} {...props} />;
}

function OriginalPrice({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("ml-1 mr-auto text-lg text-dim line-through", className)} {...props} />;
}

function Body({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-6 p-3", className)} {...props} />;
}

function List({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("space-y-3", className)} {...props} />;
}

function ListItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("flex items-start gap-3 text-sm text-dim", className)} {...props} />;
}

function Separator({ children = "Upgrade to access", className, ...props }: React.ComponentProps<"div"> & { children?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-dim", className)} {...props}>
      <span className="h-[1px] flex-1 bg-dim/40" />
      <span className="shrink-0 text-dim">{children}</span>
      <span className="h-[1px] flex-1 bg-dim/40" />
    </div>
  );
}

export { Card, Header, Description, Plan, PlanName, Badge, Price, MainPrice, Period, OriginalPrice, Body, List, ListItem, Separator };

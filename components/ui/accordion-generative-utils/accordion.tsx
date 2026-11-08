"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// Accordion pieces for the "accordion-generative" block (the block's own
// utils file wasn't provided, so this is written from its description):
// - `variant="card"` turns each item into a separate rounded card;
// - <AccordionStreamingContent> types its answer in one character at a time
//   when the item opens. The panel opens straight to the height of the
//   finished text (the full text sits underneath, invisible, reserving the
//   space — and it is what screen readers read), a caret trails the last
//   character, punctuation adds a short pause, and a reduced-motion
//   preference shows the finished answer at once.

type Variant = "default" | "card";
const VariantContext = React.createContext<Variant>("default");

type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & { variant?: Variant };

const Accordion = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Root>, AccordionProps>(
  ({ variant = "default", className, ...props }, ref) => (
    <VariantContext.Provider value={variant}>
      <AccordionPrimitive.Root ref={ref} className={cn(variant === "card" && "flex flex-col gap-3", className)} {...(props as React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>)} />
    </VariantContext.Provider>
  )
);
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(VariantContext);
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
        variant === "card"
          ? "overflow-hidden rounded-card border border-ink/10 bg-surface/60 transition-colors data-[state=open]:border-blood-hi/35 data-[state=open]:bg-surface"
          : "border-b border-ink/10",
        className
      )}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const variant = React.useContext(VariantContext);
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between gap-4 text-right font-bold text-ink transition-all [&[data-state=open]>svg]:rotate-180",
          variant === "card" ? "px-5 py-4 text-[14.5px] sm:px-6 sm:py-5" : "py-4",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-dim transition-transform duration-200" aria-hidden="true" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

type StreamingProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>, "children"> & {
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Pause before the first character, in ms. */
  startDelay?: number;
};

const AccordionStreamingContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, StreamingProps>(
  ({ text, speed = 12, startDelay = 180, className, ...props }, ref) => {
    const variant = React.useContext(VariantContext);
    return (
      <AccordionPrimitive.Content
        ref={ref}
        className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        {...props}
      >
        {/* Radix mounts this only while open, so each opening streams again. */}
        <Streamer
          text={text}
          speed={speed}
          startDelay={startDelay}
          className={cn(variant === "card" ? "px-5 pb-5 sm:px-6" : "pb-4", "text-[13.5px] leading-7 text-ink/80", className)}
        />
      </AccordionPrimitive.Content>
    );
  }
);
AccordionStreamingContent.displayName = "AccordionStreamingContent";

const PAUSE_AFTER = /[.,!?;:،؛؟…]/;

function Streamer({ text, speed, startDelay, className }: { text: string; speed: number; startDelay: number; className?: string }) {
  const [count, setCount] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      setDone(true);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        setDone(true);
        return;
      }
      timer = setTimeout(step, PAUSE_AFTER.test(text[i - 1]) ? speed * 9 : speed);
    };
    timer = setTimeout(step, startDelay);
    return () => clearTimeout(timer);
  }, [text, speed, startDelay]);

  return (
    <div className={className}>
      <div className="relative">
        {/* full answer: reserves the final height and is what assistive tech reads */}
        <p className="opacity-0">{text}</p>
        {/* the visible, streaming copy, laid over it in the same box */}
        <p aria-hidden="true" className="absolute inset-0">
          {/* the newest characters glow red while they're being "written" */}
          {done ? text : text.slice(0, Math.max(0, count - 14))}
          {!done && <span className="text-blood-hi">{text.slice(Math.max(0, count - 14), count)}</span>}
          {!done && <span className="mr-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-caret-blink bg-blood-hi" />}
        </p>
      </div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionStreamingContent };

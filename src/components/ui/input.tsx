import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-xl border border-soft bg-white px-4 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-porto-digital focus:ring-2 focus:ring-porto-digital/20 disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-12 w-full rounded-xl border border-soft bg-white px-4 text-base text-ink outline-none transition-colors focus:border-porto-digital focus:ring-2 focus:ring-porto-digital/20 disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Select.displayName = "Select";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[72px] w-full rounded-xl border border-soft bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-porto-digital focus:ring-2 focus:ring-porto-digital/20",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

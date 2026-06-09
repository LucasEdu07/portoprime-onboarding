import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-porto text-white hover:bg-porto-digital active:bg-porto-deep shadow-sm",
  secondary: "bg-prime text-porto-deep hover:brightness-95",
  outline: "border border-porto text-porto bg-white hover:bg-canvas",
  ghost: "text-porto hover:bg-canvas",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

/** Botão pill da marca. Use `asChild` para envolver um <Link>. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

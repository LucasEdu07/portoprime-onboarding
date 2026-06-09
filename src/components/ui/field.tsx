import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/** Wrapper de campo com label visível (sempre) e mensagem de erro acessível. */
export function Field({ label, htmlFor, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink/55">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-alert">
          {error}
        </p>
      )}
    </div>
  );
}

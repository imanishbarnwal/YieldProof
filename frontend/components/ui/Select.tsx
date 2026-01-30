"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, children, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "w-full bg-card/80 border border-primary/20 rounded-2xl px-3 py-2 text-foreground text-sm backdrop-blur-sm hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all duration-200 appearance-none cursor-pointer pr-10 custom-select shadow-none",
              error && "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20",
              className
            )}
            ref={ref}
            style={{ boxShadow: 'none' }}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/60 pointer-events-none" />
        </div>
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
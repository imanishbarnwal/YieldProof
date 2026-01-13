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
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "w-full bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-sm hover:border-slate-500/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 appearance-none cursor-pointer pr-10",
              error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
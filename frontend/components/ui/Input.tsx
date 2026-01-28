"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  icon?: React.ReactNode
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, success, icon, helperText, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="space-y-2">
        {label && (
          <motion.label
            className="form-label"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60 z-10">
              {icon}
            </div>
          )}
          <motion.input
            type={type}
            className={cn(
              "form-input",
              "flex h-12 w-full rounded-2xl border bg-background/60 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-foreground/40 transition-all duration-200",
              "border-primary/20 focus:border-primary/60 focus:ring-2 focus:ring-ring/20",
              "hover:border-primary/40 hover:bg-background/80",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-11",
              error && "border-destructive/70 focus:border-destructive/70 focus:ring-destructive/30",
              success && "border-accent/70 focus:border-accent/70 focus:ring-accent/30",
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileFocus={{ scale: 1.005 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            {...props}
          />

          {/* Enhanced focus glow effect */}
          {isFocused && (
            <motion.div
              className={cn(
                "absolute inset-0 rounded-2xl -z-10 blur-xl transition-all duration-300",
                error ? "bg-destructive/10" : success ? "bg-accent/10" : "bg-primary/10"
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>

        {/* Helper text, error, or success message */}
        {(helperText || error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1"
          >
            {error && (
              <p className="form-error flex items-center gap-1 text-destructive">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {success && (
              <p className="form-success flex items-center gap-1 text-accent-foreground bg-accent/10 p-2 rounded-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-foreground/60 text-sm">{helperText}</p>
            )}
          </motion.div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
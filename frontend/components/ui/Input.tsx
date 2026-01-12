"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    
    return (
      <div className="space-y-2">
        {label && (
          <motion.label 
            className="text-sm font-medium text-slate-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <motion.input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-slate-600/50 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-slate-500 transition-all duration-300 focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:shadow-lg focus:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-red-500/70 focus:border-red-400/70 focus:ring-red-400/30 focus:shadow-red-500/20",
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            {...props}
          />
          {/* Focus glow effect */}
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 -z-10 blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
        {error && (
          <motion.p 
            className="text-sm text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
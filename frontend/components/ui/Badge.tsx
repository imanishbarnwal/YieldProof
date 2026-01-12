"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-300 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-indigo-500/50 bg-gradient-to-r from-indigo-600/30 to-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/20",
        secondary: "border-slate-600/50 bg-gradient-to-r from-slate-700/30 to-slate-600/20 text-slate-300 shadow-lg shadow-slate-600/20",
        success: "border-emerald-500/50 bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 text-emerald-200 shadow-lg shadow-emerald-500/20",
        destructive: "border-red-500/50 bg-gradient-to-r from-red-600/30 to-red-500/20 text-red-200 shadow-lg shadow-red-500/20",
        warning: "border-amber-500/50 bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-200 shadow-lg shadow-amber-500/20",
        outline: "border-slate-500/50 text-slate-300 hover:bg-slate-800/30",
        info: "border-cyan-500/50 bg-gradient-to-r from-cyan-600/30 to-cyan-500/20 text-cyan-200 shadow-lg shadow-cyan-500/20",
        purple: "border-purple-500/50 bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-purple-200 shadow-lg shadow-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
}

function Badge({ className, variant, pulse = false, children, ...props }: BadgeProps) {
  return (
    <motion.div 
      className={cn(badgeVariants({ variant }), className)} 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      {...props}
    >
      {pulse && (
        <motion.div
          className="w-2 h-2 rounded-full bg-current mr-2"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {children}
    </motion.div>
  )
}

export { Badge, badgeVariants }
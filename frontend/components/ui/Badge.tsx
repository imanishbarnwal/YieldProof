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
        default: "border-[#FF6B35]/50 bg-gradient-to-r from-[#FF6B35]/30 to-[#FF6B35]/20 text-[#FF6B35] shadow-lg shadow-[#FF6B35]/20",
        secondary: "border-[#004E89]/50 bg-gradient-to-r from-[#004E89]/30 to-[#004E89]/20 text-[#F8F9FA]/80 shadow-lg shadow-[#004E89]/20",
        success: "border-emerald-500/50 bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 text-emerald-200 shadow-lg shadow-emerald-500/20",
        destructive: "border-red-500/50 bg-gradient-to-r from-red-600/30 to-red-500/20 text-red-200 shadow-lg shadow-red-500/20",
        warning: "border-[#FFD23F]/50 bg-gradient-to-r from-[#FFD23F]/30 to-[#FFD23F]/20 text-[#FFD23F] shadow-lg shadow-[#FFD23F]/20",
        outline: "border-[#FF6B35]/30 text-[#F8F9FA]/80 hover:bg-[#FF6B35]/10",
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
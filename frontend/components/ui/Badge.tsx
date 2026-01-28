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
        default: "border-primary/50 bg-gradient-to-r from-primary/30 to-primary/20 shadow-lg shadow-primary/20",
        secondary: "border-muted/50 bg-gradient-to-r from-muted/30 to-muted/20 shadow-lg shadow-muted/20",
        success: "border-accent/50 bg-gradient-to-r from-accent/30 to-accent/20 shadow-lg shadow-accent/20",
        destructive: "border-destructive/50 bg-gradient-to-r from-destructive/30 to-destructive/20 shadow-lg shadow-destructive/20",
        warning: "border-accent/50 bg-gradient-to-r from-accent/30 to-accent/20 shadow-lg shadow-accent/20",
        outline: "border-primary/30 hover:bg-primary/10",
        info: "border-primary/50 bg-gradient-to-r from-primary/30 to-primary/20 shadow-lg shadow-primary/20",
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
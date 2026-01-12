"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { motion, HTMLMotionProps } from "framer-motion"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide relative overflow-hidden group",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-indigo-600",
                primary: "bg-gradient-to-r from-slate-100 to-white text-slate-900 shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/40 font-medium",
                secondary: "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100 shadow-lg shadow-slate-700/25 hover:shadow-xl hover:shadow-slate-700/40 border border-slate-600/50",
                outline: "border-2 border-indigo-500/50 bg-transparent text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400/70 backdrop-blur-sm",
                ghost: "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40",
                success: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40",
                link: "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-12 rounded-lg px-6 text-base",
                xl: "h-14 rounded-lg px-8 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<"button">>,
    HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
        if (asChild) {
            return (
                <Slot
                    className={cn(buttonVariants({ variant, size, className }))}
                    ref={ref}
                    {...props}
                >
                    {children}
                </Slot>
            )
        }

        return (
            <motion.button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                }}
                whileTap={{ 
                    scale: 0.98,
                    transition: { duration: 0.1 }
                }}
                {...props}
            >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500" />
                
                <div className="relative z-10 flex items-center justify-center">
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        </motion.div>
                    )}
                    {children}
                </div>
            </motion.button>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
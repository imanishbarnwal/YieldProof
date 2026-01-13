"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { motion, HTMLMotionProps } from "framer-motion"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide relative overflow-hidden group",
    {
        variants: {
            variant: {
                default: "bg-slate-800 hover:bg-slate-700 text-white shadow-lg border border-slate-600/50 hover:border-slate-500/50 rounded-xl",
                primary: "bg-white hover:bg-slate-100 text-slate-900 shadow-lg font-semibold rounded-xl border border-slate-200/50",
                secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 shadow-lg border border-slate-600/50 rounded-xl backdrop-blur-sm",
                outline: "border-2 border-slate-600/50 bg-slate-900/50 text-white hover:bg-slate-800/50 hover:border-slate-500/50 backdrop-blur-sm rounded-xl",
                ghost: "text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-lg",
                destructive: "bg-red-700 hover:bg-red-600 text-white shadow-lg rounded-xl border border-red-600/50",
                success: "bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg rounded-xl border border-emerald-600/50",
                link: "text-slate-400 underline-offset-4 hover:underline hover:text-slate-300 rounded-lg",
            },
            size: {
                default: "h-11 px-6 py-3",
                sm: "h-9 px-4 py-2 text-xs rounded-lg",
                lg: "h-13 px-8 py-4 text-base rounded-xl",
                xl: "h-16 px-10 py-5 text-lg rounded-xl font-semibold",
                icon: "h-11 w-11 rounded-lg",
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
                    transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{ 
                    scale: 0.98,
                    transition: { duration: 0.1, ease: "easeInOut" }
                }}
                {...props}
            >
                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                
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
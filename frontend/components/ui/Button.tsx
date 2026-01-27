"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { motion, HTMLMotionProps } from "framer-motion"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide relative overflow-hidden group btn-ripple",
    {
        variants: {
            variant: {
                default: "bg-[#1A1A2E]/80 hover:bg-[#1A1A2E] text-white shadow-lg border border-[#FF6B35]/20 hover:border-[#FF6B35]/40 rounded-full",
                primary: "bg-[#FF6B35] hover:bg-[#E85A2A] text-white shadow-lg font-semibold rounded-full border border-[#FF6B35]",
                secondary: "bg-[#004E89] hover:bg-[#004E89]/80 text-white shadow-lg border border-[#004E89]/50 rounded-full backdrop-blur-sm",
                outline: "border-2 border-[#FF6B35]/30 bg-[#1A1A2E]/50 text-white hover:bg-[#FF6B35]/10 hover:border-[#FF6B35]/50 backdrop-blur-sm rounded-full",
                ghost: "text-[#F8F9FA]/80 hover:bg-[#FF6B35]/10 hover:text-white rounded-full",
                destructive: "bg-red-700 hover:bg-red-600 text-white shadow-lg rounded-full border border-red-600/50",
                success: "bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg rounded-full border border-emerald-600/50",
                link: "text-[#F8F9FA]/60 underline-offset-4 hover:underline hover:text-[#FF6B35] rounded-full",
            },
            size: {
                default: "h-11 px-6 py-3",
                sm: "h-9 px-4 py-2 text-xs",
                lg: "h-13 px-8 py-4 text-base",
                xl: "h-16 px-10 py-5 text-lg font-semibold",
                icon: "h-11 w-11",
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B35]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                
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
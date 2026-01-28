"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { motion, HTMLMotionProps } from "framer-motion"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide relative overflow-hidden group",
    {
        variants: {
            variant: {
                default: "bg-background hover:bg-muted text-foreground shadow-lg border border-border/50 hover:border-border rounded-lg",
                primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg font-medium rounded-lg border border-primary",
                secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg border border-secondary/50 rounded-lg",
                outline: "border-2 border-primary/30 bg-background/50 text-foreground hover:bg-primary/10 hover:border-primary/50 backdrop-blur-sm rounded-lg",
                ghost: "text-foreground/80 hover:bg-primary/10 hover:text-foreground rounded-lg",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg",
                success: "bg-success text-success-foreground hover:bg-success/90 rounded-lg",
                link: "text-foreground/80 underline-offset-4 hover:underline hover:text-primary rounded-lg",
            },
            size: {
                default: "h-11 px-6 py-3",
                sm: "h-9 px-4 py-2 text-xs",
                lg: "h-13 px-8 py-4 text-base",
                xl: "h-16 px-10 py-5 text-lg font-medium",
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
                    y: -2,
                    transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{
                    scale: 0.98,
                    transition: { duration: 0.1, ease: "easeInOut" }
                }}
                {...props}
            >
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
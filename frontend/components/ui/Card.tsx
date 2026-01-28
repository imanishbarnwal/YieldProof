"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">>, HTMLMotionProps<"div"> {
    hover?: boolean
    variant?: "default" | "accent" | "success" | "warning"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = true, variant = "default", children, ...props }, ref) => {
        const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
            default: "bg-card border-border",
            accent: "bg-card border-primary/30",
            success: "bg-card border-success/30",
            warning: "bg-card border-accent/30"
        }

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "rounded-lg group relative overflow-hidden",
                    variantClasses[variant as keyof typeof variantClasses],
                    hover && "transition-all duration-300 hover:border-primary/40 hover:shadow-lg-hover hover:-translate-y-1 dark:hover:shadow-primary/10",
                    className
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={hover ? {
                    y: -2,
                    transition: { duration: 0.2 }
                } : undefined}
                {...props}
            >
                {/* Top accent bar */}
                <div className="card-accent-bar" />
                <div className="relative z-10">
                    {children}
                </div>
            </motion.div>
        )
    }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight text-card-foreground",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground leading-relaxed", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
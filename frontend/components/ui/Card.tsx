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
            default: "glass-card",
            accent: "glass-card accent-glow border-[#FF6B35]/30",
            success: "glass-card success-glow border-emerald-500/30",
            warning: "glass-card warning-glow border-[#FFD23F]/30"
        }

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "rounded-3xl group relative",
                    variantClasses[variant as keyof typeof variantClasses],
                    hover && "hover:shadow-2xl transition-all duration-300 hover:border-[#FF6B35]/40",
                    className
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={hover ? {
                    y: -4,
                    transition: { duration: 0.2 }
                } : undefined}
                {...props}
            >
                {/* Top accent bar */}
                <div className="card-accent-bar" />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF6B35]/5 via-transparent to-[#FFD23F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
            "text-lg font-semibold leading-none tracking-tight text-white",
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
        className={cn("text-sm text-[#F8F9FA]/60 leading-relaxed", className)}
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
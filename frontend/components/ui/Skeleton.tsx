import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-700/30", className)}
            style={{
                animationDuration: '2s', // Slower, more subtle pulsing
                animationTimingFunction: 'ease-in-out'
            }}
            {...props}
        />
    )
}

export { Skeleton }

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, ShieldAlert, Loader2, XCircle } from "lucide-react";

type StatusType = "submitted" | "attesting" | "verified" | "flagged" | "rejected";

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
    label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
    const styles = {
        submitted: "bg-[#004E89]/10 text-[#F8F9FA]/70 border-[#004E89]/20",
        attesting: "bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20",
        verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        flagged: "bg-[#FFD23F]/10 text-[#FFD23F] border-[#FFD23F]/20",
        rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };

    const icons = {
        submitted: Clock,
        attesting: Loader2,
        verified: CheckCircle2,
        flagged: ShieldAlert,
        rejected: XCircle,
    };

    // Fallback to Clock if status unknown
    const Icon = icons[status] || Clock;
    const style = styles[status] || styles.submitted;

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-light border backdrop-blur-sm tracking-wide",
                style,
                className
            )}
        >
            <Icon className={cn("w-3.5 h-3.5", status === "attesting" && "animate-spin")} />
            <span className="capitalize font-light">{label || status}</span>
        </div>
    );
}

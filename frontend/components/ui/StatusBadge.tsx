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
        submitted: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        attesting: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        flagged: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        rejected: "bg-red-500/10 text-red-500 border-red-500/20",
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
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                style,
                className
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            <span className="capitalize">{label || status}</span>
        </div>
    );
}

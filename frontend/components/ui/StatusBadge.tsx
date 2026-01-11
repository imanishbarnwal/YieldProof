import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";

type StatusType = "pending" | "verified" | "attested" | "rejected";

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const styles = {
        pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        attested: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    const icons = {
        pending: Clock,
        attested: ShieldAlert,
        verified: CheckCircle2,
        rejected: ShieldAlert,
    };

    const Icon = icons[status];

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                styles[status],
                className
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            <span className="capitalize">{status}</span>
        </div>
    );
}

import React from 'react';

type Status = 'Pending' | 'Attested' | 'Approved' | 'Challenged';

interface StatusBadgeProps {
    status: Status;
}

const styles = {
    Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Attested: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Challenged: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
            {status}
        </span>
    );
}

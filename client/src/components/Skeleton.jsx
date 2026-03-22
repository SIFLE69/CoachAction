export function Skeleton({ className = "" }) {
    return (
        <div className={`skeleton ${className}`}></div>
    );
}

export function TableSkeleton({ rows = 5 }) {
    return (
        <div className="card overflow-hidden w-full border-surface-200 dark:border-white/[0.05]">
            <div className="flex items-center gap-6 px-6 py-4 border-b border-surface-100 dark:border-white/[0.05]">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6 ml-auto" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-6 py-5 border-b border-surface-50 dark:border-white/[0.03] last:border-0 hover:bg-surface-50/50 dark:hover:bg-white/[0.01]">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4 opacity-60" />
                    </div>
                    <Skeleton className="h-5 w-20 ml-auto" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-24" />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="card p-8 flex flex-col gap-4 border-surface-200 dark:border-white/[0.05]">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-3 w-24 opacity-60" />
        </div>
    );
}

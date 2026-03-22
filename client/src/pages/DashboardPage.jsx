import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { CardSkeleton, TableSkeleton, Skeleton } from '../components/Skeleton';
import api from '../api';

const Icons = {
    TrendDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>,
    Currency: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    Lightbulb: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
};

export default function DashboardPage() {
    const { user } = useAuth();
    const { showToast, instituteName } = useUI();
    const [briefing, setBriefing] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/insights/daily-view'),
            api.get('/insights')
        ]).then(([briefingRes, insightsRes]) => {
            setBriefing(briefingRes.data);
            setInsights(insightsRes.data);
        }).catch((err) => {
            console.error('Fetch error:', err);
            showToast('Failed to sync today\'s brief', 'error');
        }).finally(() => setLoading(false));
    }, []);

    const copyReminder = (s) => {
        navigator.clipboard.writeText(`Hi ${s.name}, your ₹${s.pendingFees.toLocaleString()} fees are pending for ${instituteName}. Please clear it soon.`);
        showToast('Reminder copied to clipboard');
    };

    const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

    if (loading) return (
        <div className="page animate-in">
            <div className="flex items-end justify-between mb-12">
                <div className="space-y-3">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64 opacity-50" />
                </div>
                <div className="flex gap-6">
                    <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-6 w-24" /></div>
                    <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-6 w-24" /></div>
                </div>
            </div>
            <Skeleton className="h-32 w-full mb-10" />
            <div className="grid grid-cols-4 gap-5 mb-12">
                <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
            </div>
            <TableSkeleton rows={3} />
        </div>
    );

    const { moneyAtRisk = 0, totalPending = 0, streak = 0, biggestProblem = {}, analyzedStudents = [] } = briefing || {};
    const { leaks = [], metrics = null, totalMoneyLost = 0 } = insights || {};

    const pendingStudents = analyzedStudents.filter(s => (s.pendingFees || 0) > 0).sort((a, b) => b.pendingFees - a.pendingFees);

    return (
        <div className="page animate-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="page-title text-xl md:text-3xl">Executive Overview</h1>
                    <p className="page-subtitle text-xs md:text-sm">
                        {streak > 0
                            ? `Consistent performance for ${streak} days`
                            : `Management overview for ${instituteName}`
                        }
                    </p>
                </div>
                {metrics && (
                    <div className="flex gap-4 md:gap-8 justify-between md:justify-end border-t border-b border-[var(--border-main)] md:border-none py-4 md:py-0">
                        <div className="text-left md:text-right">
                            <p className="text-[9px] md:text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest mb-1">Profit Margin</p>
                            <p className="text-lg md:text-xl font-bold text-[var(--text-main)]">{metrics.profitMargin}%</p>
                        </div>
                        <div className="md:pl-8 md:border-l md:border-[var(--border-main)] text-left md:text-right">
                            <p className="text-[9px] md:text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest mb-1">Conversion</p>
                            <p className="text-lg md:text-xl font-bold text-[var(--text-main)]">{metrics.conversionRate}%</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Critical Alert Area */}
            {(biggestProblem?.type !== 'none' || totalMoneyLost > 0) && (
                <div className="card p-6 mb-10 border-danger/20 bg-danger/[0.02]">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center text-danger flex-shrink-0">
                            {biggestProblem.type === 'fees' ? <Icons.Currency /> : <Icons.TrendDown />}
                        </div>
                        <div className="flex-1">
                            <p className="text-base font-bold text-[var(--text-main)]">
                                {biggestProblem?.type !== 'none'
                                    ? biggestProblem.message?.replace(/🔴\s?/, '').replace('Biggest Issue: ', '')
                                    : `Strategic Leak: ${formatCurrency(totalMoneyLost)} Revenue Loss`
                                }
                            </p>
                            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-3xl leading-relaxed">
                                {biggestProblem?.description || "Inconsistent collection cycles identified. Revenue flow can be optimized by adjusting payment schedules for at-risk accounts."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                <div className="card p-5 md:p-6 border-b-2 border-b-danger/30">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Money at Risk</p>
                    <p className="text-xl md:text-2xl font-bold tracking-tight">{formatCurrency(moneyAtRisk)}</p>
                </div>
                <div className="card p-5 md:p-6">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Pending Now</p>
                    <p className="text-xl md:text-2xl font-bold text-danger tracking-tight">{formatCurrency(totalPending)}</p>
                </div>
                <div className="card p-4 md:p-6">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Recent Inquiries</p>
                    <p className="text-xl md:text-2xl font-bold tracking-tight">{metrics?.inquiries || 0}</p>
                </div>
                <div className="card p-4 md:p-6">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Monthly Revenue</p>
                    <p className="text-xl md:text-2xl font-bold text-success tracking-tight">{formatCurrency(metrics?.revenue || 0)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Collections Table */}
                    <section className="animate-in" style={{ animationDelay: '100ms', opacity: 0 }}>
                        <div className="flex items-center justify-between mb-6 px-1">
                            <p className="section-title mb-0">Urgent Receivables</p>
                            <p className="text-[11px] font-bold text-[var(--text-muted)]">{pendingStudents.length} Students</p>
                        </div>
                        {pendingStudents.length > 0 ? (
                            <div className="card shadow-sm overflow-x-auto">
                                <div className="min-w-[400px]">
                                    {pendingStudents.slice(0, 5).map((s, idx) => (
                                        <div
                                            key={s._id}
                                            className="table-row px-4 md:px-6 animate-in"
                                            style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[var(--border-subtle)] flex items-center justify-center text-[10px] md:text-xs font-bold text-[var(--text-muted)] flex-shrink-0">
                                                    {s.name?.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] md:text-[14px] font-bold truncate tracking-tight">{s.name}</p>
                                                    <p className="text-[11px] md:text-[12px] text-[var(--text-muted)] truncate">Target: {formatCurrency(s.totalFees)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 md:gap-8">
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-[13px] md:text-[15px] font-bold text-danger">{formatCurrency(s.pendingFees)}</p>
                                                    <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">Pending</p>
                                                </div>
                                                <button onClick={() => copyReminder(s)} className="btn btn-ghost px-2.5 md:px-4 h-8 md:h-9 text-[11px] md:text-xs flex-shrink-0">
                                                    Remind
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="card p-12 text-center bg-success/[0.02] border-success/10 shadow-sm">
                                <div className="text-success mb-3 flex justify-center"><Icons.Check /></div>
                                <p className="text-sm font-bold">Ledger Clear</p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Outstanding fees collection for this cycle is complete.</p>
                            </div>
                        )}
                    </section>

                    {/* Proactive Growth Advice */}
                    <section className="card p-6 bg-[var(--border-subtle)] border-[var(--border-main)] shadow-sm">
                        <div className="flex gap-4">
                            <div className="text-primary-600 mt-1"><Icons.Lightbulb /></div>
                            <div>
                                <p className="text-[14px] font-bold mb-1">CoachAction Insight</p>
                                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-2xl">
                                    {metrics?.conversionRate < 25
                                        ? "Inquiry engagement is below optimal levels. Standardizing lead response time to under 15 minutes can increase conversion by 40%."
                                        : "Growth velocity is stable. Consider optimizing staff-to-student ratios in your largest batches to maintain high fulfillment quality."
                                    }
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Growth/Leaks Sidebar */}
                <div className="space-y-12 animate-in" style={{ animationDelay: '200ms', opacity: 0 }}>
                    {leaks.length > 0 && (
                        <section>
                            <p className="section-title mb-6">Operational Leaks</p>
                            <div className="space-y-4">
                                {leaks.slice(0, 3).map((leak, idx) => (
                                    <div
                                        key={idx}
                                        className="card p-5 border-l-2 border-l-danger/30 shadow-sm animate-in"
                                        style={{ animationDelay: `${(idx + 5) * 50}ms`, opacity: 0 }}
                                    >
                                        <p className="text-[13px] font-bold text-[var(--text-main)] mb-1">{leak.message}</p>
                                        <p className="text-[12px] text-[var(--text-muted)] leading-normal">{leak.fix}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function DashboardPage() {
    const { user } = useAuth();
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
            setBriefing(null);
            setInsights(null);
        }).finally(() => setLoading(false));
    }, []);

    const copyReminder = (s) => {
        navigator.clipboard.writeText(`Hi ${s.name}, your ₹${s.pendingFees} fees are pending. Please clear it soon.`);
    };

    if (loading) return (
        <div className="page flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="w-12 h-12 border-t-2 border-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-surface-500 font-medium">Analyzing your academy...</p>
            </div>
        </div>
    );

    const { moneyAtRisk = 0, totalPending = 0, recoveredThisWeek = 0, streak = 0, biggestProblem = {}, analyzedStudents = [] } = briefing || {};
    const { leaks = [], metrics = null, totalMoneyLost = 0 } = insights || {};

    const pendingStudents = analyzedStudents.filter(s => (s.pendingFees || 0) > 0).sort((a, b) => b.pendingFees - a.pendingFees);
    const atRiskStudents = analyzedStudents.filter(s => (s.attendancePrc || 100) < 50).sort((a, b) => a.attendancePrc - b.attendancePrc);

    return (
        <div className="page animate-in">

            {/* Header */}
            <div className="flex items-end justify-between mb-12">
                <div>
                    <h1 className="page-title">Today</h1>
                    <p className="page-subtitle">
                        {streak > 0
                            ? `🔥 ${streak}-day streak · You're in the top 5% of coaches this week`
                            : 'Start today to build your streak and grow your academy'
                        }
                    </p>
                </div>
                {metrics && (
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-surface-500 tracking-widest">Profit Margin</p>
                            <p className="text-xl font-black text-white">{metrics.profitMargin}%</p>
                        </div>
                        <div className="text-right border-l border-white/[0.08] pl-4">
                            <p className="text-[10px] uppercase font-bold text-surface-500 tracking-widest">Conversion</p>
                            <p className="text-xl font-black text-white">{metrics.conversionRate}%</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Biggest Problem */}
            {(biggestProblem?.type !== 'none' || totalMoneyLost > 0) && (
                <div className="card p-6 mb-10 overflow-hidden relative" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
                    <div className="flex items-start gap-5 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center text-danger text-xl flex-shrink-0 mt-0.5">
                            {biggestProblem.type === 'fees' ? '₹' : '📉'}
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-bold text-white">
                                {biggestProblem?.type !== 'none'
                                    ? biggestProblem.message?.replace(/🔴\s?/, '').replace('Biggest Issue: ', '')
                                    : `Strategic Leak Identified: ₹${totalMoneyLost.toLocaleString()} Loss`
                                }
                            </p>
                            <p className="text-[15px] text-surface-400 mt-1.5 leading-relaxed">
                                {biggestProblem?.description || "Your business metrics show significant revenue leakage. Take action to optimize your monthly performance."}
                            </p>
                        </div>
                    </div>
                    {/* Progress bar for money lost if strategic */}
                    <div className="absolute bottom-0 left-0 h-1 bg-danger/20 w-full">
                        <div className="h-full bg-danger" style={{ width: '40%' }}></div>
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div className="flex gap-5 mb-12">
                <div className="flex-1 card p-8 text-center min-w-0 border-b-4 border-b-danger/30">
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-3">Money at Risk</p>
                    <p className="text-3xl font-black text-white">₹{moneyAtRisk.toLocaleString()}</p>
                </div>
                <div className="flex-1 card p-8 text-center min-w-0">
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-3">Today's Revenue</p>
                    <p className="text-3xl font-bold text-success">₹{recoveredThisWeek.toLocaleString()}</p>
                </div>
                <div className="flex-1 card p-8 text-center min-w-0">
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-3">Waitlist/Leads</p>
                    <p className="text-3xl font-bold text-surface-200">{metrics?.inquiries || 0}</p>
                </div>
                <div className="flex-1 card p-8 text-center min-w-0">
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-3">Alerts</p>
                    <p className="text-3xl font-bold text-danger">{atRiskStudents.length + (leaks.length > 0 ? 1 : 0)}</p>
                </div>
            </div>

            {/* Strategic Insights Section */}
            {leaks.length > 0 && (
                <section className="mb-12">
                    <p className="section-label">Monthly Strategy</p>
                    <div className="grid grid-cols-2 gap-4">
                        {leaks.slice(0, 2).map((leak, idx) => (
                            <div key={idx} className="card p-5 border-l-4 border-l-warning">
                                <p className="text-sm font-bold text-white mb-1">{leak.message}</p>
                                <p className="text-xs text-surface-500 leading-normal">{leak.fix}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 gap-12">
                {/* Fee Collections */}
                {pendingStudents.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <p className="section-label mb-0">Urgent: Fee follow-ups</p>
                            <span className="text-xs font-medium text-surface-500">{pendingStudents.length} students pending</span>
                        </div>
                        <div className="card overflow-hidden">
                            {pendingStudents.slice(0, 5).map(s => (
                                <div key={s._id} className="table-row flex items-center justify-between px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-white/[0.07] flex items-center justify-center text-base font-semibold text-surface-300">
                                            {s.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[16px] font-bold text-white">{s.name}</p>
                                            <p className="text-sm text-surface-500">Last payment: {s.paidFees > 0 ? '₹' + s.paidFees.toLocaleString() : 'Never'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-danger">₹{(s.pendingFees || 0).toLocaleString()}</p>
                                            <p className="text-[10px] text-surface-500 uppercase font-black">Due Now</p>
                                        </div>
                                        <button onClick={() => copyReminder(s)} className="btn btn-ghost px-5">
                                            Remind
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* At-Risk Students */}
                {atRiskStudents.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <p className="section-label mb-0">Retention: Dropout risk</p>
                            <span className="text-xs font-medium text-surface-500">Low attendance detected</span>
                        </div>
                        <div className="card overflow-hidden">
                            {atRiskStudents.slice(0, 4).map(s => (
                                <div key={s._id} className="table-row flex items-center justify-between px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-danger/10 flex items-center justify-center text-base font-semibold text-danger">
                                            {s.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[16px] font-bold text-white">{s.name}</p>
                                            <p className="text-sm text-surface-500">{s.phone || 'No phone recorded'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] text-surface-500 uppercase font-bold tracking-tight">Attendance</p>
                                            <p className={`text-lg font-black ${s.attendancePrc < 30 ? 'text-danger' : 'text-warning'}`}>{s.attendancePrc}%</p>
                                        </div>
                                        <div className="text-right w-20">
                                            <p className="text-[10px] text-surface-500 uppercase font-bold tracking-tight">Score</p>
                                            <span className={`badge ${s.engagementScore > 70 ? 'badge-green' : s.engagementScore > 40 ? 'badge-yellow' : 'badge-red'}`}>
                                                {s.engagementScore}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Empty state */}
            {pendingStudents.length === 0 && atRiskStudents.length === 0 && (
                <div className="card p-24 text-center mb-10 border-dashed">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success text-2xl mx-auto mb-6">✓</div>
                    <p className="text-white text-xl font-bold mb-2">Everything is under control</p>
                    <p className="text-surface-500 text-base max-w-sm mx-auto">All fees are collected and student engagement is high. You're set for a great day!</p>
                </div>
            )}

            {/* Dynamic Growth Tip */}
            <div className="card p-6 mt-12 bg-primary-600/10 border-primary-600/20">
                <div className="flex gap-4">
                    <span className="text-2xl">💡</span>
                    <div>
                        <p className="text-white font-bold mb-1">Academy Growth Tip</p>
                        <p className="text-[15px] text-surface-400 leading-relaxed">
                            {metrics?.conversionRate < 25
                                ? "Your conversion rate is low. Try offering a free trial session to inquiries to boost your sign-up rate."
                                : "Your retention is solid. Consider starting a referral program where existing students get a discount for bringing friends."
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

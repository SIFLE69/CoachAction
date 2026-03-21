import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function DashboardPage() {
    const { user } = useAuth();
    const [briefing, setBriefing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/insights/daily-view')
            .then(res => setBriefing(res.data))
            .catch(() => setBriefing(null))
            .finally(() => setLoading(false));
    }, []);

    const copyReminder = (s) => {
        navigator.clipboard.writeText(`Hi ${s.name}, your ₹${s.pendingFees} fees are pending. Please clear it soon.`);
    };

    if (loading) return (
        <div className="page flex items-center justify-center min-h-screen">
            <p className="text-surface-500">Loading today's briefing...</p>
        </div>
    );

    const { totalPending = 0, recoveredThisWeek = 0, streak = 0, biggestProblem = {}, analyzedStudents = [] } = briefing || {};
    const pendingStudents = analyzedStudents.filter(s => (s.pendingFees || 0) > 0);
    const atRiskStudents = analyzedStudents.filter(s => (s.attendancePrc || 100) < 50);

    return (
        <div className="page animate-in">

            {/* Header */}
            <div className="mb-12">
                <h1 className="page-title">Today</h1>
                <p className="page-subtitle">
                    {streak > 0
                        ? `🔥 ${streak}-day streak · Keep going`
                        : 'Start today to build your streak'
                    }
                </p>
            </div>

            {/* Biggest Problem */}
            {biggestProblem?.type !== 'none' && (
                <div className="card p-6 mb-10" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
                    <div className="flex items-start gap-5">
                        <div className="w-11 h-11 rounded-xl bg-danger/10 flex items-center justify-center text-danger text-lg flex-shrink-0 mt-0.5">!</div>
                        <div>
                            <p className="text-base font-semibold text-white">{biggestProblem.message?.replace(/🔴\s?/, '').replace('Biggest Issue: ', '')}</p>
                            <p className="text-sm text-surface-400 mt-1.5 leading-relaxed">{biggestProblem.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div className="flex gap-5 mb-12">
                <div className="flex-1 card p-8 text-center min-w-0">
                    <p className="text-sm text-surface-500 mb-2">Pending</p>
                    <p className="text-3xl font-bold text-white">₹{totalPending.toLocaleString()}</p>
                </div>
                <div className="flex-1 card p-8 text-center min-w-0">
                    <p className="text-sm text-surface-500 mb-2">Recovered</p>
                    <p className="text-3xl font-bold text-success">₹{recoveredThisWeek.toLocaleString()}</p>
                </div>
                <div className="flex-1 card p-8 text-center min-w-0">
                    <p className="text-sm text-surface-500 mb-2">At Risk</p>
                    <p className="text-3xl font-bold text-danger">{atRiskStudents.length}</p>
                </div>
            </div>

            {/* Fee Collections */}
            {pendingStudents.length > 0 && (
                <section className="mb-12">
                    <p className="section-label">Fee follow-ups</p>
                    <div className="card overflow-hidden">
                        {pendingStudents.slice(0, 5).map(s => (
                            <div key={s._id} className="table-row flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center text-sm font-semibold text-surface-300">
                                        {s.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-medium text-white">{s.name}</p>
                                        <p className="text-sm text-surface-500">₹{(s.pendingFees || 0).toLocaleString()} pending</p>
                                    </div>
                                </div>
                                <button onClick={() => copyReminder(s)} className="btn btn-ghost">
                                    Copy reminder
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* At-Risk Students */}
            {atRiskStudents.length > 0 && (
                <section className="mb-12">
                    <p className="section-label">Dropout risk</p>
                    <div className="card overflow-hidden">
                        {atRiskStudents.slice(0, 4).map(s => (
                            <div key={s._id} className="table-row flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-sm font-semibold text-danger">
                                        {s.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-medium text-white">{s.name}</p>
                                        <p className="text-sm text-surface-500">{s.attendancePrc}% attendance</p>
                                    </div>
                                </div>
                                <span className="badge badge-red">{s.engagementScore} score</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty state */}
            {pendingStudents.length === 0 && atRiskStudents.length === 0 && (
                <div className="card p-16 text-center mb-10">
                    <p className="text-surface-300 text-base font-medium mb-2">All clear today</p>
                    <p className="text-surface-500 text-sm">No urgent actions needed. Keep marking attendance daily.</p>
                </div>
            )}

            {/* Tip */}
            <div className="card p-5" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.12)' }}>
                <p className="text-sm text-surface-400 leading-relaxed">
                    <span className="text-primary-400 font-semibold">Tip:</span> Following up on the first missed day triples retention. Check attendance → call absent students → protect your revenue.
                </p>
            </div>
        </div>
    );
}

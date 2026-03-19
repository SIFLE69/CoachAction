import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// ─── Data Input Form ───────────────────────────────────────────
function DataInputForm({ onSuccess }) {
    const [form, setForm] = useState({
        students: '',
        inquiries: '',
        conversions: '',
        revenue: '',
        expenses: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const fields = [
        { key: 'students', label: 'Total Students', icon: '👨‍🎓', placeholder: 'e.g. 150' },
        { key: 'inquiries', label: 'New Inquiries', icon: '📩', placeholder: 'e.g. 30' },
        { key: 'conversions', label: 'Conversions', icon: '✅', placeholder: 'e.g. 8' },
        { key: 'revenue', label: 'Revenue (₹)', icon: '💰', placeholder: 'e.g. 200000' },
        { key: 'expenses', label: 'Expenses (₹)', icon: '📤', placeholder: 'e.g. 120000' },
    ];

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await api.post('/data/add', {
                students: Number(form.students),
                inquiries: Number(form.inquiries),
                conversions: Number(form.conversions),
                revenue: Number(form.revenue),
                expenses: Number(form.expenses),
            });
            setSuccess('Data saved successfully!');
            setForm({ students: '', inquiries: '', conversions: '', revenue: '', expenses: '' });
            onSuccess?.();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center text-lg">📊</div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Business Data</h2>
                    <p className="text-surface-200/50 text-xs">Enter today&apos;s numbers</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fields.map((f) => (
                        <div key={f.key}>
                            <label htmlFor={`field-${f.key}`} className="flex items-center gap-2 text-sm font-medium text-surface-200/70 mb-1.5">
                                <span>{f.icon}</span> {f.label}
                            </label>
                            <input
                                id={`field-${f.key}`}
                                type="number"
                                min="0"
                                value={form[f.key]}
                                onChange={(e) => handleChange(f.key, e.target.value)}
                                required
                                placeholder={f.placeholder}
                                className="w-full px-4 py-2.5 bg-surface-900/60 border border-surface-700/40 rounded-xl text-white placeholder-surface-200/25 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 text-sm"
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                    {loading ? 'Saving...' : 'Save & Generate Insights'}
                </button>
            </form>
        </div>
    );
}

// ─── Metric Cards ──────────────────────────────────────────────
function MetricCards({ metrics }) {
    if (!metrics) return null;

    const cards = [
        { label: 'Students', value: metrics.students, icon: '👨‍🎓', color: 'from-blue-500/20 to-blue-600/10' },
        { label: 'Conv. Rate', value: `${metrics.conversionRate}%`, icon: '🎯', color: 'from-green-500/20 to-green-600/10' },
        { label: 'Revenue', value: `₹${metrics.revenue.toLocaleString()}`, icon: '💰', color: 'from-amber-500/20 to-amber-600/10' },
        { label: 'Profit', value: `₹${metrics.profit.toLocaleString()}`, icon: metrics.profit >= 0 ? '📈' : '📉', color: metrics.profit >= 0 ? 'from-emerald-500/20 to-emerald-600/10' : 'from-red-500/20 to-red-600/10' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
            {cards.map((card) => (
                <div key={card.label} className="animate-fade-in-up glass rounded-xl p-4">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-base mb-2`}>
                        {card.icon}
                    </div>
                    <p className="text-surface-200/50 text-xs">{card.label}</p>
                    <p className="text-white font-bold text-lg">{card.value}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Insights Section ──────────────────────────────────────────
function InsightsSection({ insights }) {
    if (!insights || insights.length === 0) return null;

    const typeStyles = {
        success: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', icon: '✅' },
        warning: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', icon: '⚠️' },
        danger: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', icon: '🚨' },
        info: { bg: 'bg-info/10', border: 'border-info/20', text: 'text-info', icon: 'ℹ️' },
    };

    return (
        <div className="glass rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent-600/20 flex items-center justify-center text-lg">💡</div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Insights</h2>
                    <p className="text-surface-200/50 text-xs">Based on your latest data</p>
                </div>
            </div>

            <div className="space-y-3 stagger">
                {insights.map((insight, i) => {
                    const style = typeStyles[insight.type] || typeStyles.info;
                    return (
                        <div
                            key={i}
                            className={`animate-fade-in-up p-4 rounded-xl border ${style.bg} ${style.border}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
                                <div>
                                    <h3 className={`font-semibold text-sm ${style.text}`}>{insight.title}</h3>
                                    <p className="text-surface-200/70 text-sm mt-1">{insight.message}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Actions Section ───────────────────────────────────────────
function ActionsSection({ actions }) {
    if (!actions || actions.length === 0) return null;

    const priorityStyles = {
        high: 'border-l-danger bg-danger/5',
        medium: 'border-l-warning bg-warning/5',
        low: 'border-l-success bg-success/5',
        info: 'border-l-info bg-info/5',
    };

    const priorityBadge = {
        high: 'bg-danger/20 text-danger',
        medium: 'bg-warning/20 text-warning',
        low: 'bg-success/20 text-success',
        info: 'bg-info/20 text-info',
    };

    return (
        <div className="glass rounded-2xl p-6 glow animate-fade-in-up">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-lg">
                    🎯
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Daily Actions</h2>
                    <p className="text-surface-200/50 text-xs">Your focus tasks for today</p>
                </div>
            </div>

            <div className="space-y-3 stagger">
                {actions.map((action, i) => (
                    <div
                        key={i}
                        className={`animate-fade-in-up p-4 rounded-xl border-l-4 ${priorityStyles[action.priority] || priorityStyles.info}`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl flex-shrink-0">{action.icon}</span>
                                <p className="text-white text-sm font-medium">{action.action}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${priorityBadge[action.priority] || priorityBadge.info}`}>
                                {action.priority}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Empty State ───────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="glass rounded-2xl p-10 text-center animate-fade-in-up">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2">No data yet</h3>
            <p className="text-surface-200/50 text-sm max-w-sm mx-auto">
                Enter your business data above to generate personalized insights and daily actions.
            </p>
        </div>
    );
}

// ─── Dashboard Page ────────────────────────────────────────────
export default function DashboardPage() {
    const { user, logout } = useAuth();
    const [insights, setInsights] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [actions, setActions] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [insightsRes, actionsRes] = await Promise.all([
                api.get('/insights'),
                api.get('/actions'),
            ]);
            setInsights(insightsRes.data.insights);
            setMetrics(insightsRes.data.metrics);
            setActions(actionsRes.data.actions);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="min-h-screen bg-surface-950">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-surface-700/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
                            CA
                        </div>
                        <span className="text-lg font-bold text-white hidden sm:inline">
                            Coach<span className="text-primary-400">Action</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-surface-200/50 text-sm hidden sm:inline">{user?.email}</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-surface-200/70 hover:text-white bg-surface-800/50 hover:bg-surface-700/50 rounded-lg cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Greeting */}
                <div className="animate-fade-in-up">
                    <h1 className="text-2xl font-bold text-white">
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
                    </h1>
                    <p className="text-surface-200/50 text-sm mt-1">Here&apos;s your coaching business overview</p>
                </div>

                {/* Metrics */}
                {!loadingData && metrics && <MetricCards metrics={metrics} />}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Input Form */}
                    <div className="lg:col-span-2">
                        <DataInputForm onSuccess={fetchDashboardData} />
                    </div>

                    {/* Right: Insights & Actions */}
                    <div className="lg:col-span-3 space-y-6">
                        {loadingData ? (
                            <div className="glass rounded-2xl p-10 text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                <p className="text-surface-200/50 text-sm">Loading your insights...</p>
                            </div>
                        ) : insights && insights.length > 0 ? (
                            <>
                                <InsightsSection insights={insights} />
                                <ActionsSection actions={actions} />
                            </>
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

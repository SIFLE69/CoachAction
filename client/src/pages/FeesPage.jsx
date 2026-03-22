import { useState, useEffect } from 'react';
import api from '../api';
import { useUI } from '../context/UIContext';
import { TableSkeleton } from '../components/Skeleton';

const Icons = {
    CreditCard: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>,
    Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>,
    FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
};

export default function FeesPage() {
    const { showToast, instituteName, formatCurrency } = useUI();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('');
    const [pendingFees, setPendingFees] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        try {
            const [s, p] = await Promise.all([api.get('/students'), api.get('/fees/pending')]);
            setStudents(s.data);
            setPendingFees(p.data);
        } catch (err) {
            showToast('Failed to load ledger', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/payments', { studentId: selectedStudent, amount: Number(amount) });
            showToast(`Recorded payment of ${formatCurrency(amount)}`);
            setAmount('');
            setSelectedStudent('');
            setShowPayment(false);
            fetchData();
        } catch (err) {
            showToast('Failed to record payment', 'error');
        }
    };

    const copyReminder = (student) => {
        const pendingValue = student.pendingFees || (student.totalFees - (student.paidFees || 0));
        navigator.clipboard.writeText(`Hi ${student.name}, your ${formatCurrency(pendingValue)} fees are pending for ${instituteName}. Please clear it soon.`);
        showToast('Reminder copied to clipboard');
    };

    const totalOutstanding = students.reduce((sum, s) => sum + ((s.pendingFees || 0)), 0);

    return (
        <div className="page animate-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-12">
                <div>
                    <h1 className="page-title">Accounts</h1>
                    <p className="page-subtitle">Tracking {formatCurrency(totalOutstanding)} in outstanding receivables</p>
                </div>
                <button
                    onClick={() => setShowPayment(!showPayment)}
                    className={`btn h-10 px-6 font-bold ${showPayment ? 'btn-ghost text-red-600' : 'btn-primary'}`}
                >
                    {showPayment ? 'Discard' : <><Icons.CreditCard /><span className="ml-2">Record Payment</span></>}
                </button>
            </div>

            {showPayment && (
                <form onSubmit={handlePayment} className="card p-6 mb-12 animate-in border-primary-500/10 bg-primary-500/[0.01]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">Target Account</label>
                            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="input h-10 px-2 font-medium" required>
                                <option value="">Select a student...</option>
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} ({formatCurrency(s.pendingFees)} pending)</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">Authorized Amount ({localStorage.getItem('currency') === 'INR' ? '₹' : (localStorage.getItem('currency') === 'USD' ? '$' : '')})</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input h-10 font-bold" placeholder="0" required />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary px-8 h-10">Sync Transaction</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="space-y-12">
                    <TableSkeleton rows={3} />
                    <TableSkeleton rows={5} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12">
                    {/* Pending Action Items */}
                    {pendingFees.length > 0 && (
                        <section>
                            <p className="section-title mb-6">Immediate Attention Required</p>
                            <div className="card shadow-sm border-danger/10">
                                {pendingFees.map((s, idx) => {
                                    const pendingValue = s.pendingFees || (s.totalFees - (s.paidFees || 0));
                                    return (
                                        <div
                                            key={s._id}
                                            className="table-row hover:bg-danger/[0.01] animate-in"
                                            style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}
                                        >
                                            <div className="flex-1 flex items-center gap-4">
                                                <div className="w-9 h-9 rounded bg-danger/5 flex items-center justify-center text-xs font-bold text-danger">
                                                    {s.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold">{s.name}</p>
                                                    <p className="text-[11px] font-bold text-danger uppercase tracking-tight">{formatCurrency(pendingValue)} Overdue</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => copyReminder(s)}
                                                className="btn h-8 text-[11px] px-4 btn-ghost border border-[var(--border-subtle)] hover:border-danger hover:text-danger"
                                            >
                                                <Icons.Copy /><span className="ml-2">Copy Link</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Master Ledger List */}
                    <section>
                        <p className="section-title mb-6 px-1">Aggregate Financial Ledger</p>
                        <div className="card shadow-sm overflow-x-auto">
                            <div className="min-w-[800px]">
                                <div className="hidden lg:flex table-header">
                                    <div className="flex-1">Account Holder</div>
                                    <div className="w-32 text-right">Commitment</div>
                                    <div className="w-32 text-right">Recognized</div>
                                    <div className="w-32 text-right">Balance</div>
                                </div>
                                {students.length > 0 ? students.map((s, idx) => (
                                    <div
                                        key={s._id}
                                        className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-0 px-6 py-5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-main)]/50 transition-colors animate-in"
                                        style={{ animationDelay: `${idx * 40}ms`, opacity: 0 }}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-bold tracking-tight truncate">{s.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Verified Account</p>
                                            </div>
                                        </div>
                                        <div className="w-full lg:w-32 text-left lg:text-right shrink-0">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] lg:hidden uppercase mb-1 tracking-tighter">Total</p>
                                            <p className="text-[13px] font-medium text-[var(--text-muted)]">{formatCurrency(s.totalFees || 0)}</p>
                                        </div>
                                        <div className="w-full lg:w-32 text-left lg:text-right shrink-0">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] lg:hidden uppercase mb-1 tracking-tighter">Paid</p>
                                            <p className="text-[14px] font-bold text-success">{formatCurrency(s.paidFees || 0)}</p>
                                        </div>
                                        <div className="w-full lg:w-32 text-left lg:text-right shrink-0">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] lg:hidden uppercase mb-1 tracking-tighter">Pending</p>
                                            <p className={`text-[15px] font-bold tracking-tight ${(s.pendingFees || 0) > 0 ? 'text-danger' : 'text-[var(--text-muted)] opacity-40'}`}>
                                                {formatCurrency(s.pendingFees || 0)}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-32 text-center bg-[var(--border-subtle)] border-dashed">
                                        <div className="flex justify-center mb-6"><Icons.FileText /></div>
                                        <p className="text-[14px] font-bold text-[var(--text-muted)]">No active financial records identified.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

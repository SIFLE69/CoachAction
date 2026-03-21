import { useState, useEffect } from 'react';
import api from '../api';

export default function FeesPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('');
    const [pendingFees, setPendingFees] = useState([]);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        const [s, p] = await Promise.all([api.get('/students'), api.get('/fees/pending')]);
        setStudents(s.data);
        setPendingFees(p.data);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        await api.post('/payments', { studentId: selectedStudent, amount: Number(amount) });
        setAmount('');
        setSelectedStudent('');
        setShowPayment(false);
        fetchData();
    };

    const copyReminder = (student) => {
        const pending = student.totalFees - student.paidFees;
        navigator.clipboard.writeText(`Hi ${student.name}, your ₹${pending} fees are pending. Please clear it soon.`);
    };

    const totalOutstanding = students.reduce((sum, s) => sum + ((s.pendingFees || 0)), 0);

    return (
        <div className="page animate-in">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="page-title">Fees</h1>
                    <p className="page-subtitle">₹{totalOutstanding.toLocaleString()} outstanding</p>
                </div>
                <button onClick={() => setShowPayment(!showPayment)} className="btn btn-primary">
                    {showPayment ? 'Cancel' : '+ Record payment'}
                </button>
            </div>

            {showPayment && (
                <form onSubmit={handlePayment} className="card p-6 mb-10 animate-in">
                    <div className="grid grid-cols-2 gap-5 mb-5">
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block">Student</label>
                            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="input" required>
                                <option value="">Select student</option>
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} (₹{(s.pendingFees || 0).toLocaleString()} pending)</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block">Amount (₹)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input" placeholder="0" required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-success w-full py-3">Record payment</button>
                </form>
            )}

            {/* Pending reminders */}
            {pendingFees.length > 0 && (
                <section className="mb-12">
                    <p className="section-label">Pending reminders</p>
                    <div className="card overflow-hidden">
                        {pendingFees.map(s => {
                            const pending = s.totalFees - s.paidFees;
                            return (
                                <div key={s._id} className="table-row flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-sm font-semibold text-danger flex-shrink-0">
                                            {s.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-medium text-white">{s.name}</p>
                                            <p className="text-sm text-danger">₹{pending.toLocaleString()} pending</p>
                                        </div>
                                    </div>
                                    <button onClick={() => copyReminder(s)} className="btn btn-ghost">Copy reminder</button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* All students fee table */}
            <section>
                <p className="section-label">All students</p>
                <div className="card overflow-hidden">
                    <div className="flex items-center gap-4 px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider border-b border-white/[0.05]">
                        <div className="flex-1">Student</div>
                        <div className="w-32 text-right">Total</div>
                        <div className="w-32 text-right">Paid</div>
                        <div className="w-32 text-right">Pending</div>
                    </div>
                    {students.length > 0 ? students.map(s => (
                        <div key={s._id} className="table-row flex items-center gap-4 px-6 py-4">
                            <div className="flex-1">
                                <p className="text-[15px] font-medium text-white">{s.name}</p>
                            </div>
                            <div className="w-32 text-right text-[15px] text-surface-400">₹{(s.totalFees || 0).toLocaleString()}</div>
                            <div className="w-32 text-right text-[15px] text-success">₹{(s.paidFees || 0).toLocaleString()}</div>
                            <div className={`w-32 text-right text-[15px] font-semibold ${(s.pendingFees || 0) > 0 ? 'text-danger' : 'text-surface-600'}`}>
                                ₹{(s.pendingFees || 0).toLocaleString()}
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center">
                            <p className="text-surface-500">No students yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

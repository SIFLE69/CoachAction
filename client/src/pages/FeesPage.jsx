import { useState, useEffect } from 'react';
import api from '../api';

export default function FeesPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('');
    const [pendingFees, setPendingFees] = useState([]);

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
        fetchData();
        alert('Payment recorded!');
    };

    const copyReminder = (student) => {
        const msg = `Hi ${student.name}, your ₹${student.totalFees - student.paidFees} fees are pending. Please clear it soon.`;
        navigator.clipboard.writeText(msg);
        alert(`Reminder copied for ${student.name}`);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-10">Revenue & Fees</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <form onSubmit={handlePayment} className="glass p-8 rounded-3xl border border-white/5 bg-surface-900/40">
                        <h3 className="text-sm font-black text-white uppercase italic mb-6 flex items-center gap-2">💰 New Payment <span className="h-0.5 bg-surface-800 flex-1"></span></h3>
                        <div className="mb-4">
                            <label className="block text-[10px] text-surface-200/50 mb-1 uppercase font-black">Student Name</label>
                            <select
                                value={selectedStudent}
                                onChange={e => setSelectedStudent(e.target.value)}
                                className="w-full bg-surface-950 p-3 rounded-xl border border-white/5 text-white cursor-pointer hover:border-primary-500 transition-colors"
                                required
                            >
                                <option value="" className="bg-surface-950">Select Student</option>
                                {students.map(s => (
                                    <option key={s._id} value={s._id} className="bg-surface-950">
                                        {s.name} (Pending: ₹{(s.pendingFees || 0).toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-8">
                            <label className="block text-[10px] text-surface-200/50 mb-1 uppercase font-black">Payment Amount (₹)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-surface-950 p-3 rounded-xl border border-white/5 text-white" required />
                        </div>
                        <button type="submit" className="w-full bg-success text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-success/20">RECORD PAYMENT</button>
                    </form>

                    <div className="glass p-8 rounded-3xl border border-warning/20 bg-warning/5">
                        <h3 className="text-sm font-black text-warning uppercase italic mb-6">📢 Pending Reminders</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {pendingFees.map(s => (
                                <div key={s._id} className="flex justify-between items-center bg-surface-950 p-4 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-xs font-black text-white uppercase">{s.name}</p>
                                        <p className="text-[10px] text-danger font-black mt-1">₹{(s.totalFees - s.paidFees).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => copyReminder(s)} className="text-xs bg-surface-800 px-3 py-1 rounded-lg font-black hover:bg-primary-600 transition-colors">COPY</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="glass rounded-3xl overflow-hidden border border-white/5 bg-surface-900/40">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface-800/50 text-[10px] font-black uppercase tracking-widest text-surface-200/50">
                                <tr>
                                    <th className="p-5 italic">Student</th>
                                    <th className="p-5 text-right">Total Invoice</th>
                                    <th className="p-5 text-right">Settled</th>
                                    <th className="p-5 text-right">Outstanding</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-700/30">
                                {students.map(s => (
                                    <tr key={s._id} className="hover:bg-surface-800/10 transition-colors">
                                        <td className="p-5">
                                            <p className="text-sm font-black text-white tracking-widest uppercase">{s.name}</p>
                                            <p className="text-[10px] text-surface-300 opacity-50">{s.phone}</p>
                                        </td>
                                        <td className="p-5 text-right text-surface-300 font-bold">₹{s.totalFees.toLocaleString()}</td>
                                        <td className="p-5 text-right text-success/80 font-black">₹{s.paidFees.toLocaleString()}</td>
                                        <td className={`p-5 text-right font-black ${s.pendingFees > 0 ? 'text-danger' : 'text-success/50'}`}>₹{s.pendingFees.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

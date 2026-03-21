import { useState, useEffect } from 'react';
import api from '../api';

export default function BatchesPage() {
    const [batches, setBatches] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [form, setForm] = useState({ name: '', timing: '' });

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        const [b, p] = await Promise.all([api.get('/batches'), api.get('/batches/performance')]);
        setBatches(b.data);
        setPerformance(p.data);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        await api.post('/batches', form);
        setForm({ name: '', timing: '' });
        fetchData();
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-8">Scheduling & Analytics</h1>

            <form onSubmit={handleAdd} className="glass p-6 rounded-3xl mb-10 flex gap-4 items-end bg-surface-900/40">
                <div className="flex-1">
                    <label className="block text-[10px] text-surface-200/50 mb-1 uppercase font-black">Group/Batch Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-surface-950 p-3 rounded-xl border border-white/5 text-white" required />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] text-surface-200/50 mb-1 uppercase font-black">Time Slot</label>
                    <input type="text" value={form.timing} onChange={e => setForm({ ...form, timing: e.target.value })} className="w-full bg-surface-950 p-3 rounded-xl border border-white/5 text-white" required />
                </div>
                <button type="submit" className="bg-primary-600 px-8 py-3 rounded-xl font-black text-white shadow-xl shadow-primary-600/20 uppercase tracking-widest">CREATE</button>
            </form>

            <h2 className="text-sm font-black text-surface-200 uppercase tracking-widest mb-4 flex items-center gap-2">📊 Batch Performance <span className="h-1 bg-surface-800 flex-1"></span></h2>
            <div className="glass rounded-3xl overflow-hidden border border-white/5 bg-surface-900/40">
                <table className="w-full text-left">
                    <thead className="bg-surface-800/50 text-[10px] font-black uppercase tracking-widest text-surface-200/50">
                        <tr>
                            <th className="p-5 italic">Group</th>
                            <th className="p-5 text-center">Roster</th>
                            <th className="p-5 text-center">Avg Attendance</th>
                            <th className="p-5 text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-700/30 text-surface-100">
                        {performance.map(batch => (
                            <tr key={batch.name} className="hover:bg-surface-800/20 transition-all">
                                <td className="p-5 font-black text-white">{batch.name}</td>
                                <td className="p-5 text-center">{batch.studentCount} students</td>
                                <td className="p-5 text-center">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black ${batch.avgAttendance > 70 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                        {batch.avgAttendance}%
                                    </span>
                                </td>
                                <td className="p-5 text-right font-black text-success">₹{batch.revenue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

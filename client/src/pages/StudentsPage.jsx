import { useState, useEffect } from 'react';
import api from '../api';
import AttendanceChart from '../components/AttendanceChart';

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [form, setForm] = useState({ name: '', phone: '', batchId: '', totalFees: 0 });
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        const [s, b] = await Promise.all([api.get('/students'), api.get('/batches')]);
        setStudents(s.data);
        setBatches(b.data);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        await api.post('/students', form);
        setForm({ name: '', phone: '', batchId: '', totalFees: 0 });
        fetchData();
    };

    const toggleTrend = async (id) => {
        if (expandedStudent === id) {
            setExpandedStudent(null);
            setAttendanceData([]);
        } else {
            setExpandedStudent(id);
            const res = await api.get(`/attendance/history/${id}`);
            setAttendanceData(res.data);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Student Roster</h1>

            <form onSubmit={handleAdd} className="glass p-6 rounded-3xl mb-10 flex flex-wrap gap-4 items-end bg-surface-900/50">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] text-surface-200/50 mb-1 uppercase font-black">Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-surface-950 p-3 rounded-xl border border-white/5 text-white" required />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] text-surface-200/50 mb-1 uppercase font-black">Batch</label>
                    <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="w-full bg-surface-950 p-3 rounded-xl border border-white/5 text-white">
                        <option value="">No Batch</option>
                        {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="w-32">
                    <label className="block text-[10px] text-surface-200/50 mb-1 uppercase font-black">Fees (₹)</label>
                    <input type="number" value={form.totalFees} onChange={e => setForm({ ...form, totalFees: e.target.value })} className="w-full bg-surface-950 p-3 rounded-xl border border-white/5 text-white" />
                </div>
                <button type="submit" className="bg-primary-600 px-8 py-3 rounded-xl font-black text-white shadow-xl shadow-primary-600/20">ADD</button>
            </form>

            <div className="glass overflow-hidden rounded-3xl border border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-surface-800/50 text-surface-200/50 text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="p-5">Student</th>
                            <th className="p-5">Batch</th>
                            <th className="p-5 text-right">Pending</th>
                            <th className="p-5 text-center">Score</th>
                            <th className="p-5 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-700/30 text-surface-100">
                        {students.map(s => (
                            <>
                                <tr key={s._id} className="hover:bg-surface-800/20 transition-all">
                                    <td className="p-5">
                                        <p className="font-black text-white">{s.name}</p>
                                        <p className="text-[10px] text-surface-200/50">{s.phone}</p>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-xs bg-surface-800 px-3 py-1 rounded-full border border-white/5">{s.batchId?.name || '---'}</span>
                                    </td>
                                    <td className={`p-5 text-right font-black ${(s.pendingFees || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                                        ₹{(s.pendingFees || 0).toLocaleString()}
                                    </td>
                                    <td className="p-5 text-center font-black">
                                        <span className={`px-3 py-1 rounded-lg text-xs ${s.engagementScore > 70 ? 'bg-success/20 text-success' : s.engagementScore > 40 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
                                            {s.engagementScore}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button onClick={() => toggleTrend(s._id)} className="text-xl opacity-50 hover:opacity-100 transition-opacity">
                                            {expandedStudent === s._id ? '📉' : '📈'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedStudent === s._id && (
                                    <tr className="bg-surface-950/50">
                                        <td colSpan="5" className="p-8 border-b border-white/5">
                                            <AttendanceChart data={attendanceData} />
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

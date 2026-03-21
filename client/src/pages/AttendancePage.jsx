import { useState, useEffect } from 'react';
import api from '../api';

export default function AttendancePage() {
    const [view, setView] = useState('mark'); // 'mark' or 'history'
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // History specific
    const [histDate, setHistDate] = useState(new Date().toISOString().split('T')[0]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.get('/batches').then(res => setBatches(res.data));
    }, []);

    const handleBatchSelect = async (batchId) => {
        setSelectedBatch(batchId);
        const res = await api.get('/students');
        setStudents(res.data.filter(s => s.batchId?._id === batchId).map(s => ({ ...s, status: 'present' })));
    };

    const fetchHistory = async () => {
        setLoading(true);
        const res = await api.get(`/attendance/by-date?date=${histDate}&batchId=${selectedBatch}`);
        setHistory(res.data);
        setLoading(false);
    };

    useEffect(() => {
        if (view === 'history' && selectedBatch) fetchHistory();
    }, [view, histDate, selectedBatch]);

    const markAttendance = async () => {
        setLoading(true);
        await api.post('/attendance/mark', {
            date: new Date().toISOString().split('T')[0],
            students: students.map(s => ({ id: s._id, status: s.status }))
        });
        setLoading(false);
        alert('Attendance marked successfully');
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-black text-white uppercase tracking-widest">Attendance Center</h1>
                <div className="flex bg-surface-900 p-1 rounded-xl border border-white/5">
                    <button onClick={() => setView('mark')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'mark' ? 'bg-primary-600 text-white shadow-lg' : 'text-surface-200/50 hover:text-white'}`}>Mark Daily</button>
                    <button onClick={() => setView('history')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'history' ? 'bg-primary-600 text-white shadow-lg' : 'text-surface-200/50 hover:text-white'}`}>View History</button>
                </div>
            </div>

            <div className="mb-8">
                <label className="block text-xs text-surface-200/50 mb-3 uppercase tracking-wider font-black">Choose Batch</label>
                <div className="flex flex-wrap gap-3">
                    {batches.map(b => (
                        <button key={b._id} onClick={() => handleBatchSelect(b._id)}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all border ${selectedBatch === b._id ? 'bg-primary-600 border-primary-500 shadow-xl shadow-primary-600/20 text-white' : 'bg-surface-800 border-white/5 text-surface-300 hover:border-white/20'}`}>
                            {b.name}
                        </button>
                    ))}
                </div>
            </div>

            {view === 'mark' ? (
                selectedBatch && (
                    <div className="animate-fade-in-up">
                        <div className="glass rounded-3xl overflow-hidden mb-6 border border-white/5">
                            <table className="w-full text-left">
                                <thead className="bg-surface-800/50 text-surface-200/50 text-xs uppercase font-black">
                                    <tr>
                                        <th className="p-5">Student</th>
                                        <th className="p-5 text-center">Mark Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-700/30">
                                    {students.map((s, i) => (
                                        <tr key={s._id} className="hover:bg-surface-800/10 transition-colors">
                                            <td className="p-5 text-white font-bold">{s.name}</td>
                                            <td className="p-5">
                                                <div className="flex justify-center gap-3">
                                                    <button onClick={() => {
                                                        const newS = [...students]; newS[i].status = 'present'; setStudents(newS);
                                                    }} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${s.status === 'present' ? 'bg-success text-white shadow-lg shadow-success/20 scale-105' : 'bg-surface-800 text-surface-400'}`}>Present</button>
                                                    <button onClick={() => {
                                                        const newS = [...students]; newS[i].status = 'absent'; setStudents(newS);
                                                    }} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${s.status === 'absent' ? 'bg-danger text-white shadow-lg shadow-danger/20 scale-105' : 'bg-surface-800 text-surface-400'}`}>Absent</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={markAttendance} disabled={loading} className="w-full bg-primary-600 py-5 rounded-2xl font-black text-white shadow-2xl shadow-primary-600/30 hover:bg-primary-500 transition-all uppercase tracking-widest">
                            {loading ? 'Processing...' : 'Submit Attendance for Today'}
                        </button>
                    </div>
                )
            ) : (
                <div className="animate-fade-in">
                    <div className="mb-6 flex items-end gap-4">
                        <div className="flex-1 max-w-xs">
                            <label className="block text-xs text-surface-200/50 mb-2 uppercase font-black">Record Date</label>
                            <input type="date" value={histDate} onChange={e => setHistDate(e.target.value)} className="w-full bg-surface-900 border border-white/10 rounded-xl p-3 text-white focus:border-primary-500 outline-none" />
                        </div>
                    </div>

                    {selectedBatch ? (
                        <div className="glass rounded-3xl overflow-hidden border border-white/5">
                            <table className="w-full text-left">
                                <thead className="bg-surface-800/50 text-surface-200/50 text-xs uppercase font-black">
                                    <tr>
                                        <th className="p-5">Student</th>
                                        <th className="p-5 text-center">Historical Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-700/30">
                                    {history.length > 0 ? history.map(h => (
                                        <tr key={h._id}>
                                            <td className="p-5 text-white font-bold">{h.studentId?.name}</td>
                                            <td className="p-5 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${h.status === 'present' ? 'bg-success/20 text-success border border-success/20' : 'bg-danger/20 text-danger border border-danger/20'}`}>
                                                    {h.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="2" className="p-10 text-center text-surface-200/50 italic text-sm">No historical records found for this batch on {histDate}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center p-10 bg-surface-900 rounded-3xl border border-dashed border-white/5">
                            <p className="text-surface-200/50">Select a batch above to view history</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

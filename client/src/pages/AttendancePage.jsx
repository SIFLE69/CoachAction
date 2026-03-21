import { useState, useEffect } from 'react';
import api from '../api';

export default function AttendancePage() {
    const [view, setView] = useState('mark');
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
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
        <div className="page animate-in">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="page-title">Attendance</h1>
                    <p className="page-subtitle">Mark daily or view past records</p>
                </div>
                <div className="flex p-1.5 rounded-xl border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <button onClick={() => setView('mark')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-smooth ${view === 'mark' ? 'bg-primary-600 text-white' : 'text-surface-400 hover:text-white'}`}>Mark</button>
                    <button onClick={() => setView('history')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-smooth ${view === 'history' ? 'bg-primary-600 text-white' : 'text-surface-400 hover:text-white'}`}>History</button>
                </div>
            </div>

            {/* Batch Selection */}
            <div className="mb-10">
                <p className="section-label">Select batch</p>
                <div className="flex flex-wrap gap-3">
                    {batches.map(b => (
                        <button key={b._id} onClick={() => handleBatchSelect(b._id)}
                            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-smooth border ${selectedBatch === b._id
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : 'border-white/[0.08] text-surface-400 hover:text-white hover:border-white/[0.15]'
                                }`}
                            style={selectedBatch !== b._id ? { background: 'rgba(255,255,255,0.04)' } : {}}>
                            {b.name}
                        </button>
                    ))}
                </div>
            </div>

            {view === 'mark' ? (
                selectedBatch ? (
                    <div className="animate-in">
                        <div className="card overflow-hidden mb-8">
                            {students.map((s, i) => (
                                <div key={s._id} className="table-row flex items-center justify-between px-6 py-5">
                                    <div className="flex-1 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.07] flex items-center justify-center text-base font-semibold text-surface-300">
                                            {s.name?.charAt(0)}
                                        </div>
                                        <p className="text-lg font-semibold text-white">{s.name}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => { const n = [...students]; n[i].status = 'present'; setStudents(n); }}
                                            className={`px-6 py-3 rounded-xl text-[15px] font-bold transition-smooth ${s.status === 'present' ? 'bg-success/20 text-success' : 'bg-white/[0.04] text-surface-500 hover:text-surface-300'}`}
                                        >
                                            Present
                                        </button>
                                        <button
                                            onClick={() => { const n = [...students]; n[i].status = 'absent'; setStudents(n); }}
                                            className={`px-6 py-3 rounded-xl text-[15px] font-bold transition-smooth ${s.status === 'absent' ? 'bg-danger/20 text-danger' : 'bg-white/[0.04] text-surface-500 hover:text-surface-300'}`}
                                        >
                                            Absent
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={markAttendance} disabled={loading} className="btn btn-primary w-full py-4 text-base">
                            {loading ? 'Saving...' : 'Submit attendance'}
                        </button>
                    </div>
                ) : (
                    <div className="card p-16 text-center">
                        <p className="text-surface-400">Select a batch above to start marking.</p>
                    </div>
                )
            ) : (
                <div className="animate-in">
                    <div className="mb-8">
                        <label className="text-sm text-surface-500 mb-2 block">Date</label>
                        <input type="date" value={histDate} onChange={e => setHistDate(e.target.value)} className="input max-w-xs" />
                    </div>

                    {selectedBatch ? (
                        <div className="card overflow-hidden">
                            {history.length > 0 ? history.map(h => (
                                <div key={h._id} className="table-row flex items-center justify-between px-6 py-4">
                                    <p className="text-[15px] font-medium text-white">{h.studentId?.name}</p>
                                    <span className={`badge ${h.status === 'present' ? 'badge-green' : 'badge-red'}`}>{h.status}</span>
                                </div>
                            )) : (
                                <div className="p-12 text-center">
                                    <p className="text-surface-500">No records for this date.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card p-16 text-center">
                            <p className="text-surface-400">Select a batch to view history.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

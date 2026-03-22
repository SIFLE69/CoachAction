import { useState, useEffect } from 'react';
import api from '../api';
import { useUI } from '../context/UIContext';
import { TableSkeleton, Skeleton } from '../components/Skeleton';

const Icons = {
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    History: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
};

export default function AttendancePage() {
    const { showToast } = useUI();
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
        try {
            setLoading(true);
            const res = await api.get('/students');
            const batchStudents = res.data.filter(s => s.batchId?._id === batchId || s.batchId === batchId);
            setStudents(batchStudents.map(s => ({ ...s, status: s.status || 'present' })));
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/attendance/by-date?date=${histDate}&batchId=${selectedBatch}`);
            setHistory(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'history' && selectedBatch) fetchHistory();
    }, [view, histDate, selectedBatch]);

    const markAttendance = async () => {
        setLoading(true);
        try {
            await api.post('/attendance/mark', {
                date: new Date().toISOString().split('T')[0],
                students: students.map(s => ({ id: s._id, status: s.status }))
            });
            showToast('Attendance recorded for ' + students.length + ' students');
        } catch (err) {
            showToast('Failed to save attendance', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page animate-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
                <div>
                    <h1 className="page-title">Operations</h1>
                    <p className="page-subtitle">Daily verification and historical reports</p>
                </div>
                <div className="flex p-1 rounded-lg bg-[var(--border-subtle)] border border-[var(--border-main)] sm:w-auto">
                    <button
                        onClick={() => setView('mark')}
                        className={`px-6 py-2 rounded-md text-[13px] font-bold transition-all ${view === 'mark' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        Verification
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`px-6 py-2 rounded-md text-[13px] font-bold transition-all ${view === 'history' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        Report Ledger
                    </button>
                </div>
            </div>

            {/* Batch Selection */}
            <div className="mb-12">
                <p className="section-title mb-6">Target Cohort</p>
                <div className="flex flex-wrap gap-3">
                    {(batches || []).map((b, idx) => (
                        <button
                            key={b._id || b.id || idx}
                            onClick={() => handleBatchSelect(b._id || b.id)}
                            className={`px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all border scale-in ${selectedBatch === (b._id || b.id)
                                ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                                : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-primary-500 hover:text-primary-600'
                                }`}
                            style={{ animationDelay: `${idx * 30}ms`, opacity: 0 }}
                        >
                            {b.name}
                        </button>
                    ))}
                    {(batches || []).length === 0 && !loading && <Skeleton className="h-10 w-32 rounded-lg" />}
                </div>
            </div>

            {view === 'mark' ? (
                selectedBatch ? (
                    <div className="animate-in space-y-8">
                        {loading ? (
                            <TableSkeleton rows={5} />
                        ) : (
                            <>
                                <div className="card shadow-sm overflow-x-auto">
                                    <div className="min-w-[450px]">
                                        <div className="table-header hidden md:flex">
                                            <div className="flex-1">Student Particulars</div>
                                            <div className="w-64 text-right">Verification Status</div>
                                        </div>
                                        {(students || []).map((s, i) => {
                                            const id = s._id || s.id;
                                            return (
                                                <div
                                                    key={id || `mark-${i}`}
                                                    className="flex flex-col md:flex-row gap-4 items-stretch md:items-center px-4 md:px-6 py-5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-main)]/50 transition-colors animate-in"
                                                    style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
                                                >
                                                    <div className="flex-1 flex items-center gap-4 min-w-0">
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${s.status === 'present' ? 'bg-success/5 text-success' : 'bg-danger/5 text-danger'}`}>
                                                            <Icons.Check />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[14.5px] font-bold tracking-tight truncate">{s.name}</p>
                                                            <p className={`text-[10px] font-black uppercase tracking-widest ${s.status === 'present' ? 'text-success/80' : 'text-danger/80'}`}>{s.status}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => { const n = [...students]; n[i].status = 'present'; setStudents(n); }}
                                                            className={`flex-1 md:flex-none px-6 h-9 rounded-lg text-[12.5px] font-bold transition-all border ${s.status === 'present' ? 'bg-success border-success text-white shadow-sm' : 'border-[var(--border-main)] text-[var(--text-muted)] hover:bg-success/5 hover:text-success'}`}
                                                        >
                                                            P
                                                        </button>
                                                        <button
                                                            onClick={() => { const n = [...students]; n[i].status = 'absent'; setStudents(n); }}
                                                            className={`flex-1 md:flex-none px-6 h-9 rounded-lg text-[12.5px] font-bold transition-all border ${s.status === 'absent' ? 'bg-danger border-danger text-white shadow-sm' : 'border-[var(--border-main)] text-[var(--text-muted)] hover:bg-danger/5 hover:text-danger'}`}
                                                        >
                                                            A
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(students || []).length === 0 && (
                                            <div className="p-16 text-center text-[13px] text-[var(--text-muted)] font-medium">No active records for this cohort.</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={markAttendance}
                                        disabled={loading || (students || []).length === 0}
                                        className="btn btn-primary h-11 px-10 shadow-lg w-full md:w-auto"
                                    >
                                        {loading ? 'Processing...' : 'Sync Records'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="card py-32 text-center bg-[var(--border-subtle)] border-dashed">
                        <div className="flex justify-center mb-6 opacity-40"><Icons.Calendar /></div>
                        <p className="text-[16px] font-bold mb-1">Queue Empty</p>
                        <p className="text-[13px] text-[var(--text-muted)] max-w-xs mx-auto">Select a target cohort from the list above to begin daily verification session.</p>
                    </div>
                )
            ) : (
                <div className="animate-in max-w-4xl">
                    <div className="mb-10 flex flex-col md:flex-row md:items-end gap-6">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-0.5">Report Date</label>
                            <input type="date" value={histDate} onChange={e => setHistDate(e.target.value)} className="input h-10 font-bold" />
                        </div>
                        <button onClick={fetchHistory} className="btn h-10 px-8 btn-ghost">
                            <Icons.History /><span className="ml-2">Apply Date</span>
                        </button>
                    </div>

                    {selectedBatch ? (
                        <div className="card shadow-sm">
                            <div className="table-header">
                                <div className="flex-1">Student Performance</div>
                                <div className="w-32 text-right">Status</div>
                            </div>
                            {loading ? (
                                <TableSkeleton rows={4} />
                            ) : (history || []).length > 0 ? (
                                (history || []).map((h, idx) => {
                                    const id = h._id || h.id;
                                    return (
                                        <div key={id || `hist-${idx}`} className="table-row">
                                            <div className="flex-1">
                                                <p className="text-[14px] font-bold">{h.studentId?.name}</p>
                                            </div>
                                            <div className="w-32 text-right">
                                                <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm ${h.status === 'present' ? 'bg-success/5 text-success' : 'bg-danger/5 text-danger'}`}>
                                                    {h.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-20 text-center text-[var(--text-muted)]">
                                    <p className="text-sm font-medium">No verified entries for this date.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card p-24 text-center border-dashed bg-[var(--border-subtle)]">
                            <p className="text-[13px] text-[var(--text-muted)] font-medium">Select a cohort to load historical reporting data.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

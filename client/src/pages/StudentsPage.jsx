import { useState, useEffect } from 'react';
import api from '../api';
import AttendanceChart from '../components/AttendanceChart';

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [form, setForm] = useState({ name: '', phone: '', batchId: '', totalFees: 0 });
    const [showForm, setShowForm] = useState(false);
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
        setShowForm(false);
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
        <div className="page animate-in">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="page-title">Students</h1>
                    <p className="page-subtitle">{students.length} enrolled</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    {showForm ? 'Cancel' : '+ Add student'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="card p-6 mb-10 animate-in">
                    <div className="grid grid-cols-2 gap-5 mb-5">
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block">Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Student name" required />
                        </div>
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block">Phone</label>
                            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="Phone number" />
                        </div>
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block">Batch</label>
                            <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="input">
                                <option value="">No batch</option>
                                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block">Total Fees (₹)</label>
                            <input type="number" value={form.totalFees} onChange={e => setForm({ ...form, totalFees: e.target.value })} className="input" />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full py-3">Add student</button>
                </form>
            )}

            {students.length === 0 ? (
                <div className="card p-20 text-center">
                    <p className="text-surface-300 text-base font-medium mb-2">No students yet</p>
                    <p className="text-surface-500 text-sm">Add your first student to get started.</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-6 px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-widest border-b border-white/[0.05]">
                        <div className="flex-1 min-w-0">Student</div>
                        <div className="w-28">Batch</div>
                        <div className="w-32 text-right">Pending</div>
                        <div className="w-24 text-center">Score</div>
                        <div className="w-24 text-right">Trend</div>
                    </div>

                    {students.map(s => (
                        <div key={s._id}>
                            <div className="table-row flex items-center gap-6 px-6 py-5">
                                <div className="flex-1 flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-white/[0.07] flex items-center justify-center text-base font-semibold text-surface-300 flex-shrink-0">
                                        {s.name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[15px] font-semibold text-white truncate">{s.name}</p>
                                        <p className="text-sm text-surface-500 truncate">{s.phone || '—'}</p>
                                    </div>
                                </div>
                                <div className="w-28 flex-shrink-0">
                                    <span className="badge badge-neutral">{s.batchId?.name || '—'}</span>
                                </div>
                                <div className="w-32 text-right flex-shrink-0">
                                    <span className={`text-[15px] font-bold ${(s.pendingFees || 0) > 0 ? 'text-danger' : 'text-surface-500'}`}>
                                        ₹{(s.pendingFees || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-24 text-center flex-shrink-0">
                                    <span className={`badge ${(s.engagementScore || 0) > 70 ? 'badge-green' :
                                            (s.engagementScore || 0) > 40 ? 'badge-yellow' : 'badge-red'
                                        }`}>
                                        {s.engagementScore || 0}
                                    </span>
                                </div>
                                <div className="w-24 text-right flex-shrink-0">
                                    <button onClick={() => toggleTrend(s._id)} className="btn btn-ghost text-sm">
                                        {expandedStudent === s._id ? 'Hide' : 'View'}
                                    </button>
                                </div>
                            </div>
                            {expandedStudent === s._id && (
                                <div className="px-6 pb-6 animate-in">
                                    <AttendanceChart data={attendanceData} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

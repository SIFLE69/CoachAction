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
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student? All attendance and payment data for this student will be lost.')) {
            await api.delete(`/students/${id}`);
            fetchData();
        }
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

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm) ||
        s.batchId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page animate-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="page-title">Students</h1>
                    <p className="page-subtitle">{students.length} enrolled</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="input w-64 pl-10 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 text-xs">🔍</span>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-primary h-11 px-6">
                        {showForm ? 'Cancel' : '+ Add student'}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="card p-6 mb-10 animate-in">
                    <div className="grid grid-cols-2 gap-5 mb-5">
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block font-semibold">Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Student name" required autoFocus />
                        </div>
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block font-semibold">Phone</label>
                            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="Phone number" />
                        </div>
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block font-semibold">Batch</label>
                            <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="input">
                                <option value="">No batch</option>
                                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block font-semibold">Total Fees (₹)</label>
                            <input type="number" value={form.totalFees} onChange={e => setForm({ ...form, totalFees: e.target.value })} className="input" />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full py-3.5 font-bold">Add student to database</button>
                </form>
            )}

            {filteredStudents.length === 0 ? (
                <div className="card p-32 text-center">
                    <p className="text-surface-300 text-xl font-bold mb-2">
                        {searchTerm ? 'No matches found' : 'No students yet'}
                    </p>
                    <p className="text-surface-500 text-base max-w-xs mx-auto">
                        {searchTerm ? `No student found for "${searchTerm}". Try a different name or number.` : 'Start your academy by adding your first student.'}
                    </p>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="btn btn-ghost mt-6">Clear search</button>
                    )}
                </div>
            ) : (
                <div className="card overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-6 px-6 py-4 text-[11px] font-bold text-surface-500 uppercase tracking-widest border-b border-white/[0.05]">
                        <div className="flex-1 min-w-0">Student Info</div>
                        <div className="w-28">Batch</div>
                        <div className="w-32 text-right">Fee Status</div>
                        <div className="w-24 text-center">Score</div>
                        <div className="w-48 text-right">Actions</div>
                    </div>

                    {filteredStudents.map(s => (
                        <div key={s._id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-smooth">
                            <div className="table-row flex items-center gap-6 px-6 py-5">
                                <div className="flex-1 flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-white/[0.07] flex items-center justify-center text-base font-semibold text-surface-300 flex-shrink-0">
                                        {s.name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[15px] font-bold text-white truncate">{s.name}</p>
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
                                <div className="w-48 text-right flex-shrink-0 flex gap-3 justify-end items-center">
                                    <button onClick={() => toggleTrend(s._id)} className="btn btn-ghost text-xs px-3 py-2">
                                        {expandedStudent === s._id ? 'Hide' : 'Trend'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s._id)}
                                        className="w-9 h-9 rounded-xl bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-smooth group"
                                        title="Delete student"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">🗑️</span>
                                    </button>
                                </div>
                            </div>
                            {expandedStudent === s._id && (
                                <div className="px-6 pb-6 pt-2 animate-in">
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

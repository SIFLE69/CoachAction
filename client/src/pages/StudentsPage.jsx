import { useState, useEffect } from 'react';
import api from '../api';
import AttendanceChart from '../components/AttendanceChart';
import { useUI } from '../context/UIContext';
import { TableSkeleton } from '../components/Skeleton';
import Modal from '../components/Modal';

const Icons = {
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>,
    Empty: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
};

export default function StudentsPage() {
    const { showToast } = useUI();
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [form, setForm] = useState({ name: '', phone: '', batchId: '', totalFees: 0 });
    const [showForm, setShowForm] = useState(false);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, studentId: null, studentName: '' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [s, b] = await Promise.all([api.get('/students'), api.get('/batches')]);
            setStudents(s.data || []);
            setBatches(b.data || []);
        } catch (err) {
            showToast('Failed to load students', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/students', form);
            setForm({ name: '', phone: '', batchId: '', totalFees: 0 });
            setShowForm(false);
            showToast('Student added successfully');
            fetchData();
        } catch (err) {
            showToast('Failed to add student', 'error');
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.studentId) {
            showToast('Invalid student record', 'error');
            return;
        }
        try {
            await api.delete(`/students/${deleteModal.studentId}`);
            showToast(`${deleteModal.studentName} removed from database`);
            setDeleteModal({ isOpen: false, studentId: null, studentName: '' });
            fetchData();
        } catch (err) {
            showToast('Delete operation failed', 'error');
        }
    };

    const toggleTrend = async (id) => {
        if (expandedStudent === id) {
            setExpandedStudent(null);
            setAttendanceData([]);
        } else {
            setExpandedStudent(id);
            const res = await api.get(`/attendance/history/${id}`);
            setAttendanceData(res.data || []);
        }
    };

    const filteredStudents = (students || []).filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm) ||
        s.batchId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

    return (
        <div className="page animate-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <h1 className="page-title">Management</h1>
                    <p className="page-subtitle">{students.length} active enrollments</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-none">
                        <input
                            type="text"
                            placeholder="Find students..."
                            className="input w-full md:w-64 h-10"
                            style={{ paddingLeft: '3.5rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary-600 transition-colors">
                            <Icons.Search />
                        </span>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`btn h-10 px-6 ${showForm ? 'btn-ghost text-red-600' : 'btn-primary'}`}
                    >
                        {showForm ? 'Discard' : <><Icons.Plus /><span className="ml-2">Add Student</span></>}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="card p-6 mb-12 animate-in border-primary-500/10 bg-primary-500/[0.01]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">Full Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input h-10" placeholder="Student Name" required autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">Phone</label>
                            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input h-10" placeholder="Mobile" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">Assign Batch</label>
                            <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="input h-10 px-2 font-medium">
                                <option value="">Select a batch</option>
                                {(batches || []).map((b, idx) => <option key={b._id || b.id || idx} value={b._id || b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">Course Fee (₹)</label>
                            <input type="number" value={form.totalFees} onChange={e => setForm({ ...form, totalFees: e.target.value })} className="input h-10" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary px-8 h-10">Save Record</button>
                    </div>
                </form>
            )}

            {loading ? (
                <TableSkeleton rows={8} />
            ) : filteredStudents.length === 0 ? (
                <div className="card py-32 text-center bg-[var(--border-subtle)] border-dashed">
                    <div className="flex justify-center mb-6"><Icons.Empty /></div>
                    <p className="text-[16px] font-bold mb-1">
                        {searchTerm ? 'No results identified' : 'Enrollment Ledger Empty'}
                    </p>
                    <p className="text-[13px] text-[var(--text-muted)] max-w-xs mx-auto">
                        {searchTerm ? `Your search for "${searchTerm}" returned no matches.` : 'Begin by adding student profile to track attendance and fees.'}
                    </p>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="btn h-9 px-6 mt-6 btn-ghost">Reset Data Filter</button>
                    )}
                </div>
            ) : (
                <div className="card shadow-sm">
                    <div className="hidden lg:flex table-header">
                        <div className="flex-1">Student Details</div>
                        <div className="w-32">Batch</div>
                        <div className="w-32 text-right">Fee Balance</div>
                        <div className="w-32 text-center">Score</div>
                        <div className="w-40 text-right">Actions</div>
                    </div>

                    {filteredStudents.map((s, idx) => {
                        const id = s._id || s.id;
                        return (
                            <div
                                key={id || `student-${idx}`}
                                className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-main)]/50 transition-colors animate-in"
                                style={{ animationDelay: `${idx * 40}ms`, opacity: 0 }}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 px-4 md:px-6 py-4">
                                    <div className="flex-1 flex items-center gap-3 md:gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-primary-600/5 flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">
                                            {s.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-bold tracking-tight truncate">{s.name}</p>
                                            <p className="text-[12px] text-[var(--text-muted)] truncate">{s.phone || 'No phone recorded'}</p>
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-32 flex-shrink-0">
                                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-[var(--border-subtle)] text-[var(--text-muted)]">
                                            {s.batchId?.name || 'Unassigned'}
                                        </span>
                                    </div>
                                    <div className="w-full lg:w-32 text-left lg:text-right flex-shrink-0">
                                        <p className={`text-[14px] font-bold ${(s.pendingFees || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                                            {formatCurrency(s.pendingFees || 0)}
                                        </p>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Balance</p>
                                    </div>
                                    <div className="w-32 text-center flex-shrink-0 hidden lg:block">
                                        <span className={`text-[11px] font-bold px-3 py-1 rounded-sm ${(s.engagementScore || 0) > 70 ? 'bg-success/5 text-success' :
                                            (s.engagementScore || 0) > 40 ? 'bg-warning/5 text-warning' : 'bg-danger/5 text-danger'
                                            }`}>
                                            {s.engagementScore || 0}
                                        </span>
                                    </div>
                                    <div className="w-full lg:w-40 text-right flex-shrink-0 flex gap-2 justify-start lg:justify-end items-center mt-2 lg:mt-0">
                                        <button
                                            onClick={() => toggleTrend(id)}
                                            className={`btn h-8 text-[11px] px-3 ${expandedStudent === id ? 'btn-primary' : 'btn-ghost'}`}
                                        >
                                            {expandedStudent === id ? 'Collapse' : 'Insights'}
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, studentId: id, studentName: s.name })}
                                            className="h-8 w-8 rounded bg-danger/[0.03] text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-colors"
                                            title="Delete student"
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                                {expandedStudent === id && (
                                    <div className="px-4 md:px-6 pb-6 pt-2 fade-in overflow-hidden">
                                        <div className="bg-[var(--bg-main)]/50 rounded-xl p-4 md:p-6 border border-[var(--border-main)] overflow-x-auto">
                                            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Historical Engagement</p>
                                            <div className="min-w-[500px]">
                                                <AttendanceChart data={attendanceData} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, studentId: null, studentName: '' })}
                title="Remove Student Record"
                footer={
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setDeleteModal({ isOpen: false, studentId: null, studentName: '' })}
                            className="btn btn-ghost flex-1 h-10"
                        >
                            Back
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="btn btn-primary bg-danger hover:bg-red-700 flex-1 h-10"
                        >
                            Confirm Deletion
                        </button>
                    </div>
                }
            >
                <div className="text-[14px] leading-relaxed">
                    Account <strong className="font-bold text-[var(--text-main)]">{deleteModal.studentName}</strong> will be permanently removed. All associated attendance records and payment history will be purged from the system.
                </div>
            </Modal>
        </div>
    );
}


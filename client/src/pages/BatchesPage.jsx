import { useState, useEffect } from 'react';
import api from '../api';
import { useUI } from '../context/UIContext';
import { TableSkeleton } from '../components/Skeleton';
import Modal from '../components/Modal';

const Icons = {
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>,
    Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
};

export default function BatchesPage() {
    const { showToast } = useUI();
    const [batches, setBatches] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [form, setForm] = useState({ name: '', timing: '' });
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, batchId: null, batchName: '' });

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        try {
            const [b, p] = await Promise.all([api.get('/batches'), api.get('/batches/performance')]);
            setBatches(b.data || []);
            setPerformance(p.data || []);
        } catch (err) {
            showToast('Failed to load batches', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/batches', form);
            setForm({ name: '', timing: '' });
            setShowForm(false);
            showToast('New batch created successfully');
            fetchData();
        } catch (err) {
            showToast('Failed to create batch', 'error');
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.batchId) {
            showToast('Invalid batch identifier', 'error');
            return;
        }
        try {
            await api.delete(`/batches/${deleteModal.batchId}`);
            showToast(`${deleteModal.batchName} has been deleted`);
            setDeleteModal({ isOpen: false, batchId: null, batchName: '' });
            fetchData();
        } catch (err) {
            showToast('Could not delete batch', 'error');
        }
    };

    const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

    return (
        <div className="page animate-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
                <div>
                    <h1 className="page-title">Management</h1>
                    <p className="page-subtitle">{batches.length} groups of learners managed</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className={`btn h-10 px-6 font-bold ${showForm ? 'btn-ghost text-red-600' : 'btn-primary'}`}>
                    {showForm ? 'Discard' : <><Icons.Plus /><span className="ml-2">New batch</span></>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="card p-6 mb-12 animate-in border-primary-500/10 bg-primary-500/[0.01]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">Batch Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input h-10 font-medium" placeholder="Advanced Morning Batch" required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">Timing / Interval</label>
                            <input type="text" value={form.timing} onChange={e => setForm({ ...form, timing: e.target.value })} className="input h-10 font-medium" placeholder="06:00 AM – 08:30 AM" required />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary px-8 h-10">Initialize Batch</button>
                    </div>
                </form>
            )}

            {loading ? (
                <TableSkeleton rows={5} />
            ) : (performance || []).length === 0 ? (
                <div className="card py-32 text-center bg-[var(--border-subtle)] border-dashed">
                    <div className="flex justify-center mb-6"><Icons.Book /></div>
                    <p className="text-[16px] font-bold mb-1">No groups identified</p>
                    <p className="text-[13px] text-[var(--text-muted)] max-w-sm mx-auto">Group students into batches to track performance and attendance more effectively.</p>
                </div>
            ) : (
                <>
                    <p className="section-label mb-6 px-1">Cohort Performance Metrics</p>
                    <div className="card shadow-sm overflow-x-auto">
                        <div className="min-w-[800px]">
                            <div className="hidden lg:flex table-header">
                                <div className="flex-1">Group Details</div>
                                <div className="w-32 text-center">Enrolled</div>
                                <div className="w-32 text-center">Attendance Avg</div>
                                <div className="w-40 text-right">Batch Revenue</div>
                                <div className="w-20"></div>
                            </div>
                            {(performance || []).map((b, idx) => {
                                // Robust ID resolution
                                const id = b._id || b.id || b.batchId;
                                const resolvedId = id || (batches.find(bx => bx.name === b.name)?._id);

                                return (
                                    <div key={resolvedId || `batch-${idx}`} className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-0 px-6 py-4 border-b border-[var(--border-subtle)] last:border-0 group hover:bg-[var(--bg-main)]/50 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-bold tracking-tight truncate">{b.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-[var(--text-muted)]">
                                                <Icons.Clock />
                                                <p className="text-[11px] font-medium pt-0.5 truncate">{b.timing}</p>
                                            </div>
                                        </div>
                                        <div className="w-full lg:w-32 text-left lg:text-center shrink-0">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] lg:hidden uppercase mb-1 tracking-tighter">Students</p>
                                            <p className="text-[13px] font-bold">{b.studentCount} active</p>
                                        </div>
                                        <div className="w-full lg:w-32 text-left lg:text-center shrink-0">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] lg:hidden uppercase mb-1 tracking-tighter">Attendance</p>
                                            <span className={`text-[11px] font-black px-2.5 py-1 rounded-sm ${b.avgAttendance > 70 ? 'bg-success/5 text-success' : 'bg-danger/5 text-danger'}`}>{b.avgAttendance}%</span>
                                        </div>
                                        <div className="w-full lg:w-40 text-left lg:text-right shrink-0">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] lg:hidden uppercase mb-1 tracking-tighter">Revenue</p>
                                            <p className="text-[15px] font-bold text-success tracking-tight">{formatCurrency(b.revenue)}</p>
                                        </div>
                                        <div className="w-full lg:w-20 text-right shrink-0 flex justify-start lg:justify-end">
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, batchId: resolvedId, batchName: b.name })}
                                                className="h-8 w-8 rounded bg-danger/[0.03] text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                                                title="Delete batch"
                                            >
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}


            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, batchId: null, batchName: '' })}
                title="Dissolve Batch"
                footer={
                    <div className="flex gap-3 w-full">
                        <button onClick={() => setDeleteModal({ isOpen: false, batchId: null, batchName: '' })} className="btn btn-ghost flex-1 h-10">Back</button>
                        <button onClick={confirmDelete} className="btn btn-primary flex-1 h-10 bg-danger hover:bg-red-700">Dissolve Cohort</button>
                    </div>
                }
            >
                <div className="text-[14px] leading-relaxed">
                    Confirm dissolution of <strong className="font-bold text-[var(--text-main)]">{deleteModal.batchName}</strong>?
                    <br /><br />
                    Students will remain in the database but will be marked as <span className="text-amber-600 font-bold italic">Unassigned</span>. Historical records for this cohort mapping will be unlinked.
                </div>
            </Modal>
        </div>
    );
}



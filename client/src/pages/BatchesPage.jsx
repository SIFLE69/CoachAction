import { useState, useEffect } from 'react';
import api from '../api';

export default function BatchesPage() {
    const [batches, setBatches] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [form, setForm] = useState({ name: '', timing: '' });
    const [showForm, setShowForm] = useState(false);

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
        setShowForm(false);
        fetchData();
    };

    return (
        <div className="page animate-in">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="page-title">Batches</h1>
                    <p className="page-subtitle">{batches.length} active groups</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    {showForm ? 'Cancel' : '+ New batch'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="card p-6 mb-10 animate-in">
                    <div className="grid grid-cols-2 gap-5 mb-5">
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block">Batch name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Morning Batch" required />
                        </div>
                        <div>
                            <label className="text-sm text-surface-500 mb-2 block">Timing</label>
                            <input type="text" value={form.timing} onChange={e => setForm({ ...form, timing: e.target.value })} className="input" placeholder="e.g. 7 AM – 9 AM" required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full py-3">Create batch</button>
                </form>
            )}

            {performance.length === 0 ? (
                <div className="card p-20 text-center">
                    <p className="text-surface-300 text-base font-medium mb-2">No batches yet</p>
                    <p className="text-surface-500 text-sm">Create your first batch to organize students.</p>
                </div>
            ) : (
                <>
                    <p className="section-label">Performance overview</p>
                    <div className="card overflow-hidden">
                        <div className="flex items-center gap-4 px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider border-b border-white/[0.05]">
                            <div className="flex-1">Batch</div>
                            <div className="w-32 text-center">Students</div>
                            <div className="w-32 text-center">Attendance</div>
                            <div className="w-32 text-right">Revenue</div>
                        </div>
                        {performance.map(b => (
                            <div key={b.name} className="table-row flex items-center gap-4 px-6 py-4">
                                <div className="flex-1">
                                    <p className="text-[15px] font-medium text-white">{b.name}</p>
                                </div>
                                <div className="w-32 text-center text-[15px] text-surface-300">{b.studentCount}</div>
                                <div className="w-32 text-center">
                                    <span className={`badge ${b.avgAttendance > 70 ? 'badge-green' : 'badge-red'}`}>{b.avgAttendance}%</span>
                                </div>
                                <div className="w-32 text-right text-[15px] font-semibold text-success">₹{b.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

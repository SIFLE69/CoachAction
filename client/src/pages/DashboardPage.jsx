import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function DailyActions() {
    const [actions, setActions] = useState([]);
    useEffect(() => {
        api.get('/actions/daily').then(res => setActions(res.data));
    }, []);

    if (actions.length === 0) return null;

    return (
        <div className="glass p-6 rounded-3xl border border-primary-500/20 bg-primary-500/5">
            <h3 className="text-primary-400 font-black text-lg mb-4 flex items-center gap-2">📌 Today's Actions</h3>
            <div className="space-y-3">
                {actions.map((act, i) => (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${act.priority === 'high' ? 'bg-danger/10 border-danger/20' : 'bg-surface-800 border-white/5'}`}>
                        <span className="text-2xl">{act.icon}</span>
                        <p className="text-sm font-bold text-white">{act.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HighRiskStudents() {
    const [risk, setRisk] = useState([]);
    useEffect(() => {
        api.get('/students/risk').then(res => setRisk(res.data));
    }, []);

    if (risk.length === 0) return null;

    return (
        <div className="glass p-6 rounded-3xl border border-danger/20 bg-danger/5">
            <h3 className="text-danger font-black text-lg mb-4 flex items-center gap-2">⚠️ High Risk Students</h3>
            <div className="space-y-3">
                {risk.map(s => (
                    <div key={s._id} className="flex justify-between items-center p-4 bg-surface-900/50 rounded-2xl border border-white/5">
                        <div>
                            <p className="text-white font-black">{s.name}</p>
                            <div className="flex gap-3 mt-1">
                                <span className="text-[10px] bg-danger/20 text-danger px-2 py-0.5 rounded font-black uppercase">Att: {s.attendancePrc}%</span>
                                <span className="text-[10px] bg-warning/20 text-warning px-2 py-0.5 rounded font-black uppercase">Pending: ₹{s.pendingFees}</span>
                            </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${s.engagementScore > 70 ? 'bg-success/20 text-success' : s.engagementScore > 40 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
                            {s.engagementScore}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ManagementSummary() {
    const [stats, setStats] = useState({ totalStudents: 0, totalPending: 0, todayAttendance: '0%' });
    useEffect(() => {
        const fetchData = async () => {
            const [students, attendance] = await Promise.all([api.get('/students'), api.get('/attendance')]);
            const totalPending = students.data.reduce((sum, s) => sum + (s.totalFees - s.paidFees), 0);
            const today = new Date().toISOString().split('T')[0];
            const todayRecords = attendance.data.filter(a => a.date.startsWith(today));
            const present = todayRecords.filter(r => r.status === 'present').length;
            const attPrc = todayRecords.length > 0 ? Math.round((present / todayRecords.length) * 100) + '%' : 'N/A';
            setStats({ totalStudents: students.data.length, totalPending, todayAttendance: attPrc });
        };
        fetchData();
    }, []);

    const cards = [
        { label: 'Total Students', value: stats.totalStudents, icon: '👩‍🎓' },
        { label: 'Pending Fees', value: `₹${stats.totalPending.toLocaleString()}`, icon: '💸' },
        { label: "Today's Attendance", value: stats.todayAttendance, icon: '📅' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map(card => (
                <div key={card.label} className="glass p-6 rounded-3xl border border-white/5">
                    <p className="text-surface-200/50 text-[10px] uppercase font-black tracking-widest mb-1">{card.label}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-white">{card.value}</p>
                        <span className="text-2xl opacity-50">{card.icon}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    return (
        <div className="p-8 space-y-8 min-h-screen">
            <header>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Command Center</h1>
                <p className="text-surface-200/50 font-medium">Hello Coach {user?.name?.split(' ')[0] || 'My Friend'}, here is your priority list.</p>
            </header>

            <ManagementSummary />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <DailyActions />
                    <div className="glass p-10 rounded-3xl border border-white/5 text-center bg-surface-900/40">
                        <div className="text-6xl mb-6">🎯</div>
                        <h2 className="text-xl font-black text-white uppercase italic">Full Speed Ahead</h2>
                        <p className="text-surface-200/50 text-sm mt-3 max-w-md mx-auto">Manage your students and track their progress daily to increase retention by up to 40%.</p>
                    </div>
                </div>
                <aside className="space-y-8">
                    <HighRiskStudents />
                </aside>
            </div>
        </div>
    );
}

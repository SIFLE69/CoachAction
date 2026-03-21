import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
    { path: '/dashboard', label: 'Today', icon: '◉' },
    { path: '/students', label: 'Students', icon: '◎' },
    { path: '/batches', label: 'Batches', icon: '▦' },
    { path: '/attendance', label: 'Attendance', icon: '✓' },
    { path: '/fees', label: 'Fees', icon: '₹' },
];

export default function Sidebar() {
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <aside className="w-56 border-r border-white/[0.04] min-h-screen hidden lg:flex flex-col sticky top-0" style={{ background: 'rgba(10,10,10,0.95)' }}>
            <div className="px-5 pt-6 pb-8">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold">C</div>
                    <span className="text-sm font-semibold text-surface-200 tracking-tight">CoachAction</span>
                </div>
            </div>

            <nav className="px-3 flex-1">
                <p className="section-label px-2 mb-2">Menu</p>
                <div className="space-y-0.5">
                    {nav.map(link => {
                        const active = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-smooth ${active
                                        ? 'bg-white/[0.08] text-white'
                                        : 'text-surface-400 hover:bg-white/[0.04] hover:text-surface-200'
                                    }`}
                            >
                                <span className="text-xs w-5 text-center opacity-60">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="px-3 pb-5">
                <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-surface-500 hover:text-surface-300 hover:bg-white/[0.04] transition-smooth">
                    <span className="text-xs w-5 text-center">↗</span>
                    Sign out
                </button>
            </div>
        </aside>
    );
}

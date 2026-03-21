import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();
    const links = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/students', label: 'Students', icon: '👨‍🎓' },
        { path: '/batches', label: 'Batches', icon: '📅' },
        { path: '/attendance', label: 'Attendance', icon: '✅' },
        { path: '/fees', label: 'Fees', icon: '💰' },
    ];

    return (
        <aside className="w-64 bg-surface-900 border-r border-surface-700/50 min-h-screen hidden lg:block sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">CA</div>
                    <span className="text-lg font-bold text-white">CoachAction</span>
                </div>
                <nav className="space-y-1">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.path
                                    ? 'bg-primary-500/10 text-primary-400'
                                    : 'text-surface-200/50 hover:bg-surface-800 hover:text-white'
                                }`}
                        >
                            <span>{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { instituteLogo } = useUI();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg-main)]">
            <div className="w-full max-w-sm animate-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <img src={instituteLogo || "/logo.png"} alt="CoachAction" className="w-10 h-10 rounded-xl shadow-lg object-contain" />
                        <span className="text-2xl font-semibold text-[var(--text-main)] tracking-tight">CoachAction</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-sm font-medium">Elevating your strategic management</p>
                </div>

                <div className="card p-8 scale-in shadow-2xl border-[var(--border-main)]">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl text-[13px] font-medium animate-in" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Account Email</label>
                            <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input h-11" placeholder="you@office.com" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Security Key</label>
                            <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="input h-11" placeholder="••••••••" required minLength={6} />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full h-11 mt-4 shadow-lg disabled:opacity-50">
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--text-muted)] mt-8 font-medium">
                        New administrator? <Link to="/signup" className="text-primary-600 font-bold hover:underline transition-all">Request access</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

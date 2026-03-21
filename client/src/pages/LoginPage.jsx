import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
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
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm animate-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-sm font-bold">C</div>
                        <span className="text-lg font-semibold text-white tracking-tight">CoachAction</span>
                    </div>
                    <p className="text-surface-500 text-sm">Sign in to your account</p>
                </div>

                <div className="card p-6">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-surface-500 mb-1.5 block">Email</label>
                            <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
                        </div>
                        <div>
                            <label className="text-xs text-surface-500 mb-1.5 block">Password</label>
                            <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 mt-2 disabled:opacity-50">
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-surface-500 mt-5">
                        No account? <Link to="/signup" className="text-primary-400 font-medium hover:text-primary-300 transition-smooth">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

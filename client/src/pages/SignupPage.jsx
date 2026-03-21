import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            await signup(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed.');
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
                    <p className="text-surface-500 text-sm">Create your account</p>
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
                            <input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
                        </div>
                        <div>
                            <label className="text-xs text-surface-500 mb-1.5 block">Password</label>
                            <input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="Min. 6 characters" required minLength={6} />
                        </div>
                        <div>
                            <label className="text-xs text-surface-500 mb-1.5 block">Confirm password</label>
                            <input id="signup-confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 mt-2 disabled:opacity-50">
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-surface-500 mt-5">
                        Have an account? <Link to="/login" className="text-primary-400 font-medium hover:text-primary-300 transition-smooth">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, KeyRound } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [isResetMode, setIsResetMode] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fix for double login: Wait for store to update before redirecting
    useEffect(() => {
        if (user.isAuthenticated) {
            navigate('/dashboard');
        }
    }, [user.isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const { auth } = await import('../lib/firebase');

            await signInWithEmailAndPassword(auth, email, password);
            // Navigation is handled by the useEffect above
        } catch (err: any) {
            console.error("Login Error:", err);
            let msg = 'Invalid email or password.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                msg = 'No account found with this email.';
            } else if (err.code === 'auth/wrong-password') {
                msg = 'Incorrect password.';
            } else if (err.code === 'auth/too-many-requests') {
                msg = 'Too many failed attempts. Please try again later.';
            }
            setError(msg);
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const { sendPasswordResetEmail } = await import('firebase/auth');
            const { auth } = await import('../lib/firebase');

            await sendPasswordResetEmail(auth, resetEmail);
            setSuccessMessage('Password reset email sent! Check your inbox.');
            setTimeout(() => setIsResetMode(false), 3000);
        } catch (err: any) {
            console.error("Reset Error:", err);
            setError('Failed to send reset email. Please check the email address.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <div className="flex items-center justify-center py-6 md:py-12 px-6 bg-pink-50 min-h-[calc(100dvh-80px)]">
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isResetMode ? 'Reset Password' : 'Welcome back'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {isResetMode
                                ? 'Enter your email to receive a reset link.'
                                : 'Enter your details to access your account.'}
                        </p>
                    </div>

                    {isResetMode ? (
                        <form onSubmit={handlePasswordReset} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
                                    {error}
                                </div>
                            )}
                            {successMessage && (
                                <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm text-center">
                                    {successMessage}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition-colors"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-charcoal text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                                {!loading && <KeyRound size={18} />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsResetMode(false)}
                                className="w-full text-gray-500 text-sm hover:text-charcoal transition-colors"
                            >
                                Back to Login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition-colors"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsResetMode(true);
                                            setResetEmail(email);
                                        }}
                                        className="text-xs text-pink-600 font-medium hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-charcoal text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    )}

                    {!isResetMode && (
                        <div className="mt-8 text-center text-sm text-gray-500">
                            Don't have an account? <Link to="/signup" className="text-pink-600 font-bold hover:underline">Sign up</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

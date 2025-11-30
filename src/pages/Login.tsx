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

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
            const { auth, db } = await import('../lib/firebase');
            const { doc, getDoc, setDoc } = await import('firebase/firestore');

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user doc exists, if not create it (hybrid login/signup)
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    name: user.displayName,
                    createdAt: new Date().toISOString(),
                    role: 'owner',
                    settings: {
                        theme: 'light',
                        notifications: true
                    },
                    subscription: 'free' // Default to free
                });

                // Create default Master Service Menu
                await setDoc(doc(db, 'serviceMenus', user.uid), {
                    categories: ['Manicure', 'Pedicure', 'Extensions'],
                    services: [],
                    addOns: [],
                    tiers: []
                });
            }

            // Navigation handled by useEffect
        } catch (err: any) {
            console.error("Google Login Error:", err);
            console.error("Error Code:", err.code);
            console.error("Error Message:", err.message);
            setError(`Failed to sign in: ${err.message}`);
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
        <div className="min-h-screen bg-white font-sans text-charcoal flex">
            {/* Left Side - Image */}
            <div className="hidden md:block md:w-1/2 lg:w-5/12 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-10"></div>
                <img
                    src="/assets/feature_image_macro.png"
                    alt="Detailed Nail Art"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
                    <h2 className="text-4xl font-black mb-4">Master Your Craft.</h2>
                    <p className="text-lg opacity-90">Join thousands of nail artists using Lacqr to price perfectly and grow their business.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-black text-charcoal tracking-tight mb-2">
                            Lacqr<span className="text-pink-500">.</span>
                        </h1>
                        <p className="text-gray-500">
                            {isResetMode ? 'Reset your password' : 'Sign in to your account'}
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
                        <div className="space-y-6">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                <span>Sign in with Google</span>
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                                </div>
                            </div>

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

                            {!isResetMode && (
                                <div className="mt-8 text-center text-sm text-gray-500">
                                    Don't have an account? <Link to="/signup" className="text-pink-600 font-bold hover:underline">Sign up</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

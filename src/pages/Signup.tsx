import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            const { auth, db } = await import('../lib/firebase');
            const { doc, setDoc } = await import('firebase/firestore');

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                createdAt: new Date().toISOString(),
                role: 'owner', // Default role
                settings: {
                    theme: 'light',
                    notifications: true
                },
                subscription: 'free'
            });

            // Create default Master Service Menu for the new user
            await setDoc(doc(db, 'serviceMenus', user.uid), {
                categories: ['Manicure', 'Pedicure', 'Extensions'],
                services: [],
                addOns: [],
                tiers: []
            });

            navigate('/dashboard');
            setLoading(false);
        } catch (err: any) {
            console.error("Signup Error:", err);
            setError(err.message || 'Failed to create account.');
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setLoading(true);
        try {
            const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
            const { auth, db } = await import('../lib/firebase');
            const { doc, getDoc, setDoc } = await import('firebase/firestore');

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user doc exists, if not create it
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
                    subscription: 'free'
                });

                // Create default Master Service Menu
                await setDoc(doc(db, 'serviceMenus', user.uid), {
                    categories: ['Manicure', 'Pedicure', 'Extensions'],
                    services: [],
                    addOns: [],
                    tiers: []
                });
            }

            navigate('/dashboard');
        } catch (err: any) {
            console.error("Google Signup Error:", err);
            setError("Failed to sign up with Google.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-charcoal tracking-tight mb-2">
                        Lacqr<span className="text-pink-500">.</span>
                    </h1>
                    <p className="text-gray-500">Start your 14-day free trial</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
                    <div className="mb-6">
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> AI-Powered Pricing</li>
                            <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> Smart Booking System</li>
                            <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> No credit card required</li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                            <span>Sign up with Google</span>
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-6">
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
                                <span>{loading ? 'Creating Account...' : 'Get Started Free'}</span>
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="text-pink-600 font-bold hover:underline">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

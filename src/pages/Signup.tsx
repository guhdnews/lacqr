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
                }
            });

            // Create default Master Service Menu for the new user
            await setDoc(doc(db, 'serviceMenus', user.uid), {
                categories: ['Manicure', 'Pedicure', 'Extensions'],
                services: [],
                addOns: [],
                tiers: []
            });

            navigate('/dashboard');
        } catch (err: any) {
            console.error("Signup Error:", err);
            setError(err.message || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <div className="flex items-center justify-center py-12 px-6 bg-pink-50 min-h-[calc(100vh-80px)]">
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                        <p className="text-gray-500 text-sm">Start your 5 free scans today.</p>
                    </div>

                    <div className="bg-pink-50/50 p-4 rounded-xl mb-6 border border-pink-100">
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> 5 Free QuoteCam Scans</li>
                            <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> Basic Service Sorting</li>
                            <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> No credit card required</li>
                        </ul>
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

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="text-pink-600 font-bold hover:underline">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
                    <h2 className="text-4xl font-serif font-bold mb-4">Start Your Empire.</h2>
                    <p className="text-lg text-white/90">Join 500+ nail techs automating their business with Lacqr.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-6 md:p-12 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 font-serif">Create your account</h2>
                        <p className="text-gray-500 mt-2">Start your 5 free scans today.</p>
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

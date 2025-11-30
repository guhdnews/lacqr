import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Store, DollarSign, Link as LinkIcon, User, Phone, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import ServiceMenuEditor from './ServiceMenuEditor';

export default function OnboardingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: User Profile
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');

    // Step 2: Salon Profile
    const [salonName, setSalonName] = useState('');
    const [bookingHandle, setBookingHandle] = useState('');
    const [currency, setCurrency] = useState('USD');

    // Step 3: Service Menu (Handled by ServiceMenuEditor)

    // Step 4: Payments
    const [isStripeConnected, setIsStripeConnected] = useState(false);

    const { user, setUser } = useAppStore();

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            if (!user.id) throw new Error("No user ID found");

            // Save User & Salon Settings
            await setDoc(doc(db, 'users', user.id), {
                name: userName, // Update user name
                phone: userPhone,
                salonName,
                bookingHandle,
                currency,
                isStripeConnected,
                onboardingComplete: true
            }, { merge: true });

            // Update Local State
            setUser({
                ...user,
                name: userName,
                onboardingComplete: true
            });

            // Redirect to Dashboard
            router.push('/dashboard');
        } catch (error) {
            console.error("Error saving onboarding data:", error);
            alert("Failed to save setup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            await setDoc(doc(db, 'users', user.id), {
                onboardingComplete: true
            }, { merge: true });

            setUser({ ...user, onboardingComplete: true });
            router.push('/dashboard');
        } catch (error) {
            console.error("Error skipping onboarding:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full space-y-8">
                {/* Progress Bar */}
                <div className="flex items-center justify-center space-x-4 mb-12">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`flex items-center ${s < 4 ? 'w-full' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {step > s ? <Check size={20} /> : s}
                            </div>
                            {s < 4 && (
                                <div className={`flex-1 h-1 mx-4 rounded-full ${step > s ? 'bg-charcoal' : 'bg-gray-100'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Skip Button */}
                <div className="absolute top-6 right-6">
                    <button
                        onClick={handleSkip}
                        disabled={loading}
                        className="text-gray-400 hover:text-charcoal text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Skipping...' : 'Skip Setup'}
                    </button>
                </div>

                {/* Step 1: User Profile */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-serif font-bold">About You</h1>
                            <p className="text-gray-500">Let's start with your details (optional).</p>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-3xl space-y-6">
                            <div>
                                <label className="block font-bold text-charcoal mb-2">Full Name <span className="text-gray-400 font-normal text-sm">(Optional)</span></label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-transparent focus:border-pink-500 focus:ring-0 bg-white shadow-sm font-medium text-lg"
                                        placeholder="e.g. Jane Doe"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold text-charcoal mb-2">Phone Number <span className="text-gray-400 font-normal text-sm">(Optional)</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="tel"
                                        value={userPhone}
                                        onChange={(e) => setUserPhone(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-transparent focus:border-pink-500 focus:ring-0 bg-white shadow-sm font-medium text-lg"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center space-x-2"
                        >
                            <span>Next Step</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* Step 2: Salon Profile */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-serif font-bold">Your Salon</h1>
                            <p className="text-gray-500">Tell us about your business.</p>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-3xl space-y-6">
                            <div>
                                <label className="block font-bold text-charcoal mb-2">Salon Name</label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={salonName}
                                        onChange={(e) => setSalonName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-transparent focus:border-pink-500 focus:ring-0 bg-white shadow-sm font-medium text-lg"
                                        placeholder="e.g. Luxe Nails"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold text-charcoal mb-2">Booking Handle</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={bookingHandle}
                                        onChange={(e) => setBookingHandle(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-transparent focus:border-pink-500 focus:ring-0 bg-white shadow-sm font-medium text-lg"
                                        placeholder="your-salon-name"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">lacqr.com/book/{bookingHandle || 'your-handle'}</p>
                            </div>
                            <div>
                                <label className="block font-bold text-charcoal mb-2">Currency</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-transparent focus:border-pink-500 focus:ring-0 bg-white shadow-sm font-medium text-lg appearance-none"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="CAD">CAD ($)</option>
                                        <option value="AUD">AUD ($)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center space-x-2"
                            >
                                <span>Next Step</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Service Menu */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-serif font-bold">Set Your Prices</h1>
                            <p className="text-gray-500">Customize your base prices. You can fine-tune this later.</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl max-h-[60vh] overflow-y-auto">
                            <ServiceMenuEditor />
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center space-x-2"
                        >
                            <span>Looks Good</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* Step 4: Payments */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-serif font-bold">Get Paid</h1>
                            <p className="text-gray-500">Connect Stripe to accept deposits and payments.</p>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-3xl space-y-6 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                                <DollarSign size={40} className="text-pink-500" />
                            </div>
                            <h3 className="font-bold text-xl text-charcoal">Stripe Integration</h3>
                            <p className="text-gray-500">Secure payments, automated deposits, and financial reporting.</p>

                            <button
                                onClick={() => setIsStripeConnected(!isStripeConnected)}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${isStripeConnected ? 'bg-green-500 text-white' : 'bg-[#635BFF] text-white hover:bg-[#534be0]'}`}
                            >
                                {isStripeConnected ? <Check size={20} /> : <span className="font-bold">S</span>}
                                <span>{isStripeConnected ? 'Connected' : 'Connect Stripe'}</span>
                            </button>
                        </div>

                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <span>Complete Setup</span>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

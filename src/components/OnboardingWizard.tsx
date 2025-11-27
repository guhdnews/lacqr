import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, Store, DollarSign, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_MENU, type MasterServiceMenu } from '../types/serviceSchema';
import { useAppStore } from '../store/useAppStore';

export default function OnboardingWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [salonName, setSalonName] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [menu] = useState<MasterServiceMenu>(DEFAULT_MENU);

    const handleNext = () => {
        setStep(step + 1);
    };

    // Step 2 removed due to schema update
    /*
    const handleServiceUpdate = (id: string, price: number) => {
        setMenu(prev => ({
            ...prev,
            services: prev.services.map(s => s.id === id ? { ...s, basePrice: price } : s)
        }));
    };
    */

    const { user, setUser } = useAppStore();

    const handleComplete = async () => {
        setLoading(true);
        try {
            if (!user.id) throw new Error("No user ID found");

            // Save Salon Settings & Mark Onboarding Complete
            await setDoc(doc(db, 'users', user.id), {
                salonName,
                currency,
                onboardingComplete: true
            }, { merge: true });

            // Save Service Menu
            await setDoc(doc(db, 'serviceMenus', user.id), menu);

            // Update Local State
            setUser({ ...user, onboardingComplete: true });

            // Redirect to Dashboard
            navigate('/lacqr-lens');
        } catch (error) {
            console.error("Error saving onboarding data:", error);
            alert("Failed to save setup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full space-y-8">
                {/* Progress Bar */}
                <div className="flex items-center justify-center space-x-4 mb-12">
                    {[1, 2].map((s) => (
                        <div key={s} className={`flex items-center ${s < 2 ? 'w-full' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {step > s ? <Check size={20} /> : s}
                            </div>
                            {s < 2 && (
                                <div className={`flex-1 h-1 mx-4 rounded-full ${step > s ? 'bg-charcoal' : 'bg-gray-100'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Salon Details */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-serif font-bold">Welcome to Lacqr</h1>
                            <p className="text-gray-500">Let's get your digital salon set up.</p>
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
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!salonName}
                            className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Next Step</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* Step 2: Completion */}
                {step === 2 && (
                    <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
                            <Sparkles size={48} />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-serif font-bold">You're All Set!</h1>
                            <p className="text-gray-500 text-lg">Your salon is ready for the future.</p>
                        </div>

                        <div className="bg-pink-50 p-6 rounded-3xl max-w-sm mx-auto">
                            <p className="text-charcoal font-medium">
                                "I'm ready to start scanning sets and making money."
                            </p>
                        </div>

                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <span>Enter Dashboard</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

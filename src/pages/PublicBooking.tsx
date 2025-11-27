import { useState } from 'react';
import { Sparkles, Check, ArrowRight, Camera, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AI_SERVICE } from '../services/ai';
import type { ServiceRecommendation } from '../types/ai';
import type { ServiceSelection } from '../types/serviceSchema';

export default function PublicBooking() {
    const [step, setStep] = useState<'upload' | 'analyzing' | 'result' | 'profile'>('upload');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<ServiceSelection | null>(null);
    const [recommendation, setRecommendation] = useState<ServiceRecommendation | null>(null);

    // Profile State
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImagePreview(URL.createObjectURL(file));
            setStep('analyzing');

            try {
                // Call Real AI Service
                const recResult = await AI_SERVICE.recommendService(file);
                const anaResult = await AI_SERVICE.analyzeImage(file);

                setRecommendation(recResult);
                setAnalysis(anaResult);
                setStep('result');
            } catch (error) {
                console.error("AI Error", error);
                alert("Something went wrong with the analysis. Please try again.");
                setStep('upload');
            }
        }
    };

    const [consent, setConsent] = useState(false);

    const handleSubmitProfile = async () => {
        if (!clientName || !clientPhone || !clientEmail || !consent) {
            alert("Please fill in all fields and accept the terms.");
            return;
        }
        setSubmitting(true);

        try {
            const newClient = {
                name: clientName,
                email: clientEmail,
                phone: clientPhone,
                notes: `Requested: ${recommendation?.booking_codes.join(', ')}`,
                tags: ['New', 'Online Booking'],
                joinedDate: new Date().toISOString(),
                history: []
            };

            // Save to Firestore
            await addDoc(collection(db, 'clients'), newClient);

            alert("Booking request sent! The nail tech will contact you shortly.");

            // Reset
            setStep('upload');
            setImagePreview(null);
            setClientName('');
            setClientPhone('');
            setClientEmail('');
            setConsent(false);
        } catch (error) {
            console.error("Error saving booking:", error);
            alert("Failed to send request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            {/* Header */}
            <header className="p-6 border-b border-pink-50 flex justify-center">
                <h1 className="text-2xl font-serif font-bold text-charcoal">Jessica's Nail Studio</h1>
            </header>

            <main className="max-w-md mx-auto p-6 pb-24">
                {step === 'upload' && (
                    <div className="space-y-8 text-center mt-10">
                        <div>
                            <h2 className="text-3xl font-serif font-bold mb-4">Find Your Perfect Set</h2>
                            <p className="text-gray-500">Upload a photo of the nails you want, and I'll tell you exactly what to book.</p>
                        </div>

                        <label className="block w-full aspect-[4/5] bg-pink-50 rounded-3xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-100 transition-colors group">
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <Camera size={32} className="text-pink-500" />
                            </div>
                            <span className="font-medium text-pink-900">Upload Inspiration</span>
                            <span className="text-sm text-pink-400 mt-1">or take a photo</span>
                        </label>
                    </div>
                )}

                {step === 'analyzing' && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="text-pink-400 animate-pulse" size={32} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Analyzing Design...</h3>
                            <p className="text-gray-500">Identifying length, shape, and art complexity.</p>
                        </div>
                    </div>
                )}

                {step === 'result' && analysis && recommendation && (
                    <div className="space-y-6 animate-in slide-in-from-bottom fade-in duration-500">
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md">
                            <img src={imagePreview!} alt="Analysis" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                <div className="text-white">
                                    <p className="font-bold text-lg">{analysis.base.shape} • {analysis.base.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
                            <h3 className="font-serif font-bold text-xl mb-4 text-charcoal">You Should Book:</h3>
                            <div className="space-y-3">
                                {recommendation.booking_codes.map((code, i) => (
                                    <div key={i} className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm">
                                        <div className="bg-pink-100 p-2 rounded-full">
                                            <Check size={16} className="text-pink-600" />
                                        </div>
                                        <span className="font-bold text-lg">{code}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                                {recommendation.reasoning}
                            </p>
                        </div>

                        <button
                            onClick={() => setStep('profile')}
                            className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                            <span>Continue to Booking</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {step === 'profile' && (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <div>
                            <h2 className="text-2xl font-serif font-bold mb-2">One Last Thing!</h2>
                            <p className="text-gray-500">Create your profile so I can save this design to your history.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-pink-300 focus:ring-0 transition-all"
                                    placeholder="e.g. Jessica Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-pink-300 focus:ring-0 transition-all"
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-pink-300 focus:ring-0 transition-all"
                                    placeholder="jessica@example.com"
                                />
                            </div>
                            <div className="flex items-start space-x-3 pt-2">
                                <div className="flex items-center h-5">
                                    <input
                                        id="consent"
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        className="w-4 h-4 border-gray-300 rounded text-pink-600 focus:ring-pink-500"
                                    />
                                </div>
                                <label htmlFor="consent" className="text-sm text-gray-600">
                                    I agree to the processing of my personal data for the purpose of this booking request.
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmitProfile}
                            disabled={submitting || !consent}
                            className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {submitting && <Loader2 className="animate-spin" size={20} />}
                            <span>{submitting ? 'Sending...' : 'Send to Tech & Book'}</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

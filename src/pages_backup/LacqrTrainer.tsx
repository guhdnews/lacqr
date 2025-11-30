import { useState, useEffect } from 'react';
import { Check, X, Trophy, Star } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, increment, limit } from 'firebase/firestore';
import type { ServiceSelection } from '../types/serviceSchema';
import ServiceConfigurator from '../components/ServiceConfigurator';

interface TrainingItem {
    id: string;
    imageUrl: string;
    finalSelection: ServiceSelection;
    verificationCount?: number;
}

export default function LacqrTrainer() {
    const [items, setItems] = useState<TrainingItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showCorrection, setShowCorrection] = useState(false);

    // Fetch unverified items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const q = query(
                    collection(db, 'training_data'),
                    // In a real app, we'd filter by verificationCount < 3
                    // For demo, we'll just grab recent ones
                    limit(10)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TrainingItem[];

                // Filter out items that don't have the necessary structure (legacy data)
                const validData = data.filter(item => item.finalSelection && item.imageUrl);
                setItems(validData);
            } catch (error) {
                console.error("Error fetching training data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const currentItem = items[currentIndex];

    const handleVerify = async () => {
        if (!currentItem) return;

        // Optimistic UI update
        setPoints(p => p + 10);
        setStreak(s => s + 1);
        nextItem();

        // Background update
        try {
            const ref = doc(db, 'training_data', currentItem.id);
            await updateDoc(ref, {
                verificationCount: increment(1),
                lastVerifiedAt: new Date()
            });
        } catch (error) {
            console.error("Error verifying item:", error);
        }
    };

    const handleCorrect = () => {
        setShowCorrection(true);
    };

    const submitCorrection = async (correctedSelection: ServiceSelection) => {
        if (!currentItem) return;

        // Optimistic UI update
        setPoints(p => p + 50);
        setStreak(s => s + 1);
        setShowCorrection(false);
        nextItem();

        // Background update
        try {
            const ref = doc(db, 'training_data', currentItem.id);
            await updateDoc(ref, {
                finalSelection: correctedSelection, // Overwrite with correction
                verificationCount: 1, // Reset count or set to 1 (since this is a strong signal)
                isCorrection: true,
                correctedAt: new Date()
            });
        } catch (error) {
            console.error("Error submitting correction:", error);
        }
    };

    const nextItem = () => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // End of queue
            alert("You've reviewed all pending items! Great job!");
            setItems([]); // Clear to show empty state
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading training data...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="max-w-md mx-auto p-8 text-center space-y-6">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <Trophy size={48} className="text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-charcoal">All Caught Up!</h2>
                <p className="text-gray-600">You've verified all pending images. The AI is getting smarter thanks to you!</p>
                <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Session Points</p>
                    <p className="text-4xl font-bold text-pink-500">{points}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20">
            {/* Header / Stats */}
            <div className="flex justify-between items-center bg-charcoal text-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <Trophy size={20} className="text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Lacqr Points</p>
                        <p className="text-xl font-bold">{points}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold">Streak</p>
                    <div className="flex items-center justify-end space-x-1">
                        <span className="text-xl font-bold text-pink-400">{streak}</span>
                        <Star size={14} className="text-pink-400 fill-pink-400" />
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative">
                {/* Image */}
                <div className="h-80 bg-black relative">
                    <img
                        src={currentItem.imageUrl}
                        alt="Training Data"
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                        Verify AI Guess
                    </div>
                </div>

                {/* AI Guess Summary */}
                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">AI Detected</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-lg text-sm font-bold border border-pink-100">
                                {currentItem.finalSelection.base.system}
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                                {currentItem.finalSelection.base.length}
                            </span>
                            {currentItem.finalSelection.art.level && (
                                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100">
                                    {currentItem.finalSelection.art.level}
                                </span>
                            )}
                            {currentItem.finalSelection.bling.density !== 'None' && (
                                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-bold border border-yellow-100">
                                    {currentItem.finalSelection.bling.density} Bling
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!showCorrection ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleCorrect}
                                className="py-4 rounded-xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors flex flex-col items-center justify-center"
                            >
                                <X size={24} className="mb-1" />
                                <span>Incorrect</span>
                                <span className="text-xs font-normal opacity-70">+50 pts</span>
                            </button>
                            <button
                                onClick={handleVerify}
                                className="py-4 rounded-xl bg-green-500 text-white font-bold shadow-lg hover:bg-green-600 transition-colors flex flex-col items-center justify-center"
                            >
                                <Check size={24} className="mb-1" />
                                <span>Looks Good</span>
                                <span className="text-xs font-normal opacity-70">+10 pts</span>
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-4 fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-charcoal">Correct the Details</h3>
                                <button
                                    onClick={() => setShowCorrection(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                            {/* Mini Configurator */}
                            <div className="max-h-96 overflow-y-auto border rounded-xl mb-4">
                                <CorrectionWrapper
                                    initialSelection={currentItem.finalSelection}
                                    onSubmit={submitCorrection}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper to handle the state of the correction
function CorrectionWrapper({ initialSelection, onSubmit }: { initialSelection: ServiceSelection, onSubmit: (s: ServiceSelection) => void }) {
    const [selection, setSelection] = useState(initialSelection);

    return (
        <div className="space-y-4">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <ServiceConfigurator
                    initialSelection={initialSelection}
                    onUpdate={setSelection}
                />
            </div>
            <button
                onClick={() => onSubmit(selection)}
                className="w-full py-3 bg-charcoal text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all"
            >
                Submit Correction (+50 pts)
            </button>
        </div>
    );
}

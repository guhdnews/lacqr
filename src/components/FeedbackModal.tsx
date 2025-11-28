import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    context: 'lacqr_lens' | 'smart_quote';
    resultId?: string; // Optional ID of the quote or scan if available
    aiResult?: any; // The AI result object to store with feedback
}

export default function FeedbackModal({ isOpen, onClose, context, resultId, aiResult }: FeedbackModalProps) {
    const { user } = useAppStore();
    const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!rating && !comment) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userId: user?.id || 'anonymous',
                userName: user?.name || 'Anonymous',
                context,
                rating,
                comment,
                resultId: resultId || null,
                aiResult: aiResult || null, // Store the AI result for debugging
                createdAt: new Date(),
                userAgent: navigator.userAgent
            });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setRating(null);
                setComment('');
            }, 2000);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Give Feedback</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h4>
                            <p className="text-gray-500">Your feedback helps us improve.</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <p className="text-gray-600 mb-4 font-medium">How was the AI analysis?</p>
                                <div className="flex justify-center gap-6">
                                    <button
                                        onClick={() => setRating('positive')}
                                        className={`p-4 rounded-2xl transition-all ${rating === 'positive' ? 'bg-green-100 text-green-600 ring-2 ring-green-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <ThumbsUp size={32} />
                                    </button>
                                    <button
                                        onClick={() => setRating('negative')}
                                        className={`p-4 rounded-2xl transition-all ${rating === 'negative' ? 'bg-red-100 text-red-600 ring-2 ring-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <ThumbsDown size={32} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Comments (Optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us what went wrong or what you liked..."
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none min-h-[100px] resize-none"
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || (!rating && !comment)}
                                className="w-full py-3 bg-charcoal text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

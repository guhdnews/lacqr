'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Loader2, Lock } from 'lucide-react';

// Initialize Stripe outside component to avoid re-initialization
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number; // in dollars
    currency?: string;
    salonId: string;
    onSuccess: (paymentIntentId: string) => void;
}

function CheckoutForm({ amount, onSuccess, onError }: { amount: number, onSuccess: (id: string) => void, onError: (msg: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is required but we handle redirect manually if needed, 
                // or use redirect: 'if_required' to stay on page
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || "Payment failed");
            onError(error.message || "Payment failed");
            setLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log("✅ Payment succeeded:", paymentIntent.id);
            onSuccess(paymentIntent.id);
        } else {
            setErrorMessage("Unexpected payment status.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                    <X size={16} />
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Lock size={18} />}
                <span>Pay ${amount.toFixed(2)} Deposit</span>
            </button>
        </form>
    );
}

export default function PaymentModal({ isOpen, onClose, amount, currency = 'usd', salonId, onSuccess }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && amount > 0) {
            // Create Payment Intent
            fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // Convert to cents
                    currency,
                    salonId
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setClientSecret(data.clientSecret);
                    }
                })
                .catch((err) => setError("Failed to initialize payment"));
        }
    }, [isOpen, amount, currency, salonId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-charcoal flex items-center gap-2">
                        <Lock size={18} className="text-green-500" />
                        Secure Payment
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {error ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={24} />
                            </div>
                            <p className="text-red-600 font-medium mb-2">Payment Error</p>
                            <p className="text-gray-500 text-sm">{error}</p>
                            <button onClick={onClose} className="mt-4 text-gray-400 underline text-sm">Close</button>
                        </div>
                    ) : clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                            <CheckoutForm
                                amount={amount}
                                onSuccess={onSuccess}
                                onError={(msg) => console.error(msg)}
                            />
                        </Elements>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="animate-spin text-pink-500" size={32} />
                            <p className="text-gray-400 text-sm">Initializing secure checkout...</p>
                        </div>
                    )}
                </div>

                {/* Footer Trust Badges */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        Powered by <span className="font-bold text-gray-500">Stripe</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SmartQuoteView from '@/components/SmartQuoteView';
import { MasterServiceMenu } from '@/types/serviceSchema';
import { DEFAULT_MENU } from '@/utils/pricingCalculator';

interface PublicBookingPageProps {
    params: {
        username: string;
    };
}

export default function PublicBookingPage({ params }: PublicBookingPageProps) {
    const [salonUser, setSalonUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSalonUser = async () => {
            try {
                // Query users by bookingHandle (username)
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('bookingHandle', '==', params.username.toLowerCase()));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setError("Salon not found.");
                } else {
                    const userData = querySnapshot.docs[0].data();
                    setSalonUser({ id: querySnapshot.docs[0].id, ...userData });
                }
            } catch (err) {
                console.error("Error fetching salon:", err);
                setError("Failed to load booking page.");
            } finally {
                setLoading(false);
            }
        };

        if (params.username) {
            fetchSalonUser();
        }
    }, [params.username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !salonUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
                    <p className="text-gray-500">{error || "This booking page does not exist."}</p>
                </div>
            </div>
        );
    }

    const config = salonUser.bookingConfig || {
        themeColor: '#ec4899',
        welcomeMessage: `Welcome to ${salonUser.salonName || salonUser.name}'s booking page!`,
        policies: [],
        showSocialLinks: false
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dynamic Header */}
            <div style={{ backgroundColor: config.themeColor }} className="text-white py-12 px-4 text-center shadow-lg">
                <h1 className="text-3xl font-black mb-2">{salonUser.salonName || salonUser.name}</h1>
                <p className="opacity-90 max-w-md mx-auto">{config.welcomeMessage}</p>
            </div>

            <div className="max-w-md mx-auto -mt-8 px-4 pb-12">
                {/* Policies Card */}
                {config.policies && config.policies.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h3 className="font-bold text-gray-900 mb-3">Please Read Before Booking</h3>
                        <ul className="space-y-2">
                            {config.policies.map((policy: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                    {policy}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Smart Quote Engine */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-center mb-6">Get a Quote & Book</h2>
                        <SmartQuoteView
                            menu={salonUser.serviceMenu || DEFAULT_MENU}
                            isAuthenticated={false} // Public view
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

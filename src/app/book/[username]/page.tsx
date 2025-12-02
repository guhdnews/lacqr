/* eslint-disable @next/next/no-img-element */
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
                console.log("🔍 Fetching salon for handle:", params.username);
                // Query users by bookingHandle (username)
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('bookingHandle', '==', params.username.toLowerCase()));
                const querySnapshot = await getDocs(q);

                console.log("📸 Query snapshot size:", querySnapshot.size);

                if (querySnapshot.empty) {
                    console.warn("⚠️ No salon found for handle:", params.username);
                    setError("Salon not found.");
                } else {
                    const userData = querySnapshot.docs[0].data();
                    console.log("✅ Salon found:", userData.salonName);
                    setSalonUser({ id: querySnapshot.docs[0].id, ...userData });
                }
            } catch (err) {
                console.error("❌ Error fetching salon:", err);
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
        themeColor: salonUser.brandColor || '#ec4899',
        welcomeMessage: `Welcome to ${salonUser.salonName || salonUser.name}'s booking page!`,
        policies: [],
        showSocialLinks: false,
        font: 'sans',
        buttonStyle: 'rounded'
    };

    const brandColor = salonUser.brandColor || config.themeColor || '#ec4899';

    // Font mapping
    const fontClass = {
        'sans': 'font-sans',
        'serif': 'font-serif',
        'mono': 'font-mono'
    }[config.font as string] || 'font-sans';

    // Button radius mapping (passed to CSS variable or used in child components if possible, 
    // for now applying to a wrapper that might be used by SmartQuoteView if it uses CSS variables or inheritance)
    const buttonRadiusClass = {
        'rounded': 'rounded-xl',
        'pill': 'rounded-full',
        'square': 'rounded-none'
    }[config.buttonStyle as string] || 'rounded-xl';

    return (
        <div className={`min-h-screen bg-gray-50 ${fontClass}`}>
            {/* Dynamic Header */}
            <div className="relative">
                {/* Header Image or Color Background */}
                <div
                    className="h-48 w-full bg-cover bg-center"
                    style={{
                        backgroundColor: brandColor,
                        backgroundImage: salonUser.headerImageUrl ? `url(${salonUser.headerImageUrl})` : 'none'
                    }}
                >
                    {!salonUser.headerImageUrl && (
                        <div className="h-full w-full flex items-center justify-center bg-black/10">
                            {/* Optional pattern or gradient overlay if no image */}
                        </div>
                    )}
                </div>

                {/* Profile Section */}
                <div className="max-w-md mx-auto px-4 relative -mt-16 text-center z-10 mb-8">
                    <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 p-1 shadow-xl">
                        {salonUser.logoUrl ? (
                            <img
                                src={salonUser.logoUrl}
                                alt={salonUser.salonName || "Salon Logo"}
                                className="w-full h-full rounded-full object-cover bg-gray-200"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl font-bold">
                                {(salonUser.salonName?.[0] || salonUser.name?.[0] || 'S').toUpperCase()}
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 mb-1">{salonUser.salonName || salonUser.name}</h1>
                    <p className="text-gray-500 font-medium mb-4">@{salonUser.bookingHandle}</p>

                    {/* Welcome Card */}
                    <div
                        className={`bg-white p-6 shadow-lg text-white relative overflow-hidden ${buttonRadiusClass}`}
                        style={{ backgroundColor: brandColor }}
                    >
                        <h3 className="font-bold mb-2 relative z-10">Welcome</h3>
                        <p className="text-sm opacity-90 relative z-10">{config.welcomeMessage}</p>
                        {/* Decorative circle */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pb-12">
                {/* Policies Card */}
                {config.policies && config.policies.length > 0 && (
                    <div className={`bg-white shadow-sm border border-gray-100 p-6 mb-6 ${buttonRadiusClass}`}>
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
                <div className={`bg-white shadow-xl border border-gray-100 overflow-hidden ${buttonRadiusClass}`}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-center mb-6">Get a Quote & Book</h2>
                        <SmartQuoteView
                            menu={salonUser.serviceMenu || DEFAULT_MENU}
                            isAuthenticated={false} // Public view
                            themeColor={brandColor}
                            buttonStyle={config.buttonStyle}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
